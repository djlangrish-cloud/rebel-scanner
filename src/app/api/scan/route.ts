import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { randomUUID } from 'crypto'
import type { Check, CheckStatus } from '@/lib/types'

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function makeCheck(
  name: string,
  status: CheckStatus,
  detail: string,
  fix?: string
): Check {
  return { name, status, detail, ...(fix ? { fix } : {}) }
}

async function fetchRawHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
    redirect: 'follow',
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
  }
  return response.text()
}

async function fetchRenderedHtml(url: string): Promise<string | null> {
  const apiKey = process.env.BROWSERLESS_API_KEY
  if (!apiKey) return null

  try {
    const response = await fetch('https://chrome.browserless.io/content', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, waitFor: 2000 }),
      signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) return null
    return response.text()
  } catch {
    return null
  }
}

function extractBodyText($: cheerio.CheerioAPI): string {
  const bodyClone = $('body').clone()
  bodyClone.find('script, style, noscript').remove()
  return bodyClone.text().replace(/\s+/g, ' ').trim()
}

// ─── FINDABLE ────────────────────────────────────────────────────────────────

async function scoreFindable(url: string, $: cheerio.CheerioAPI): Promise<{ score: number; checks: Check[] }> {
  const checks: Check[] = []
  let score = 0

  // 1. HTTPS
  if (url.startsWith('https://')) {
    score += 5
    checks.push(makeCheck('HTTPS', 'good', 'Your site is served over HTTPS — secure and trustworthy for crawlers.'))
  } else {
    checks.push(makeCheck('HTTPS', 'critical', 'Your site is not using HTTPS.', 'Redirect all traffic to HTTPS and obtain an SSL certificate.'))
  }

  // 2. robots.txt
  const origin = new URL(url).origin
  try {
    const robotsRes = await fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(5000) })
    if (robotsRes.ok) {
      const robotsText = await robotsRes.text()
      const aiCrawlers = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'CCBot']
      const blocked = aiCrawlers.filter((bot) => {
        const regex = new RegExp(`User-agent:\\s*${bot}[\\s\\S]*?Disallow:\\s*/`, 'i')
        return regex.test(robotsText)
      })
      if (blocked.length === 0) {
        score += 5
        checks.push(makeCheck('robots.txt', 'good', 'robots.txt exists and does not block major AI crawlers.'))
      } else {
        score += 3
        checks.push(
          makeCheck(
            'robots.txt',
            'needs_work',
            `robots.txt is blocking these AI crawlers: ${blocked.join(', ')}.`,
            `Remove or update the Disallow rules for: ${blocked.join(', ')} to allow AI search engines to index your content.`
          )
        )
      }
    } else {
      score += 2
      checks.push(
        makeCheck(
          'robots.txt',
          'needs_work',
          'No robots.txt file found.',
          'Create a /robots.txt file. At minimum, allow all crawlers with "User-agent: *\\nAllow: /".'
        )
      )
    }
  } catch {
    score += 2
    checks.push(
      makeCheck(
        'robots.txt',
        'needs_work',
        'Could not fetch robots.txt.',
        'Ensure /robots.txt is accessible and properly configured.'
      )
    )
  }

  // 3. sitemap.xml
  try {
    const sitemapRes = await fetch(`${origin}/sitemap.xml`, { signal: AbortSignal.timeout(5000) })
    if (sitemapRes.ok) {
      score += 5
      checks.push(makeCheck('sitemap.xml', 'good', 'sitemap.xml found — helps crawlers discover all your pages.'))
    } else {
      checks.push(
        makeCheck(
          'sitemap.xml',
          'needs_work',
          'No sitemap.xml found.',
          'Generate an XML sitemap and submit it to Google Search Console. Most CMS platforms have plugins for this.'
        )
      )
    }
  } catch {
    checks.push(
      makeCheck(
        'sitemap.xml',
        'needs_work',
        'Could not check for sitemap.xml.',
        'Ensure /sitemap.xml is publicly accessible.'
      )
    )
  }

  // 4. Canonical tag
  const canonical = $('link[rel="canonical"]').attr('href')
  if (canonical) {
    score += 5
    checks.push(makeCheck('Canonical tag', 'good', `Canonical URL is set to: ${canonical}`))
  } else {
    checks.push(
      makeCheck(
        'Canonical tag',
        'needs_work',
        'No canonical tag found.',
        'Add <link rel="canonical" href="https://yoursite.com/this-page"> to the <head> to prevent duplicate content issues.'
      )
    )
  }

  // 5. Meta robots (noindex check)
  const metaRobots = $('meta[name="robots"]').attr('content') || $('meta[name="Robots"]').attr('content')
  if (metaRobots) {
    if (metaRobots.toLowerCase().includes('noindex')) {
      checks.push(
        makeCheck(
          'Meta robots',
          'critical',
          `Meta robots tag contains "noindex" — this page will not be indexed by search engines.`,
          'Remove the "noindex" directive from the meta robots tag unless you intentionally want this page hidden from search engines.'
        )
      )
    } else {
      score += 5
      checks.push(makeCheck('Meta robots', 'good', `Meta robots is set to: "${metaRobots}" — indexing is allowed.`))
    }
  } else {
    score += 5
    checks.push(makeCheck('Meta robots', 'good', 'No meta robots tag — page is indexable by default.'))
  }

  return { score: Math.min(score, 25), checks }
}

// ─── QUOTABLE ────────────────────────────────────────────────────────────────

function scoreQuotable($: cheerio.CheerioAPI): { score: number; checks: Check[] } {
  const checks: Check[] = []
  let score = 0

  // 1. Word count
  const bodyText = extractBodyText($)
  const wordCount = countWords(bodyText)
  if (wordCount >= 300) {
    score += 5
    checks.push(makeCheck('Word count', 'good', `${wordCount.toLocaleString()} words — enough content for AI to quote from.`))
  } else if (wordCount >= 150) {
    score += 3
    checks.push(
      makeCheck(
        'Word count',
        'needs_work',
        `Only ${wordCount} words — on the thin side for AI citation.`,
        'Aim for at least 300 words of substantive body content. Expand your key points with more detail and context.'
      )
    )
  } else {
    checks.push(
      makeCheck(
        'Word count',
        'critical',
        `Only ${wordCount} words — far too thin for AI crawlers to extract meaningful content.`,
        'Add substantial written content (300+ words). AI models need enough text to understand and quote your page.'
      )
    )
  }

  // 2. Single H1
  const h1Count = $('h1').length
  if (h1Count === 1) {
    score += 5
    checks.push(makeCheck('Single H1', 'good', `Exactly one H1 tag found: "${$('h1').first().text().trim().slice(0, 80)}"`))
  } else if (h1Count === 0) {
    score += 2
    checks.push(
      makeCheck(
        'Single H1',
        'needs_work',
        'No H1 tag found on this page.',
        'Add a single, descriptive H1 tag that clearly summarises the page topic.'
      )
    )
  } else {
    score += 2
    checks.push(
      makeCheck(
        'Single H1',
        'needs_work',
        `${h1Count} H1 tags found — only one is recommended.`,
        'Consolidate your H1 tags into a single, primary heading that represents the page topic.'
      )
    )
  }

  // 3. Heading hierarchy
  const headings: number[] = []
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    headings.push(parseInt((el as cheerio.Element).tagName.replace('h', ''), 10))
  })
  let hierarchyOk = true
  for (let i = 1; i < headings.length; i++) {
    if (headings[i] > headings[i - 1] + 1) {
      hierarchyOk = false
      break
    }
  }
  if (headings.length === 0 || hierarchyOk) {
    score += 4
    checks.push(makeCheck('Heading hierarchy', 'good', 'Headings follow a logical H1 → H2 → H3 order.'))
  } else {
    score += 2
    checks.push(
      makeCheck(
        'Heading hierarchy',
        'needs_work',
        'Heading levels are skipped (e.g., H1 → H3).',
        'Ensure headings descend in order without skipping levels. This helps AI understand the structure of your content.'
      )
    )
  }

  // 4. Lists or tables
  const hasList = $('ul, ol, table').length > 0
  if (hasList) {
    score += 5
    checks.push(makeCheck('Lists / tables', 'good', 'Structured content (lists or tables) found — great for AI extraction.'))
  } else {
    checks.push(
      makeCheck(
        'Lists / tables',
        'needs_work',
        'No lists or tables found.',
        'Add bullet lists, numbered lists, or tables to present information in a structured format AI models can easily extract.'
      )
    )
  }

  // 5. Paragraph length
  const paragraphs = $('p').toArray()
  if (paragraphs.length > 0) {
    const totalWords = paragraphs.reduce((sum, p) => {
      return sum + countWords($(p).text())
    }, 0)
    const avgPLength = totalWords / paragraphs.length
    if (avgPLength <= 200) {
      score += 3
      checks.push(makeCheck('Paragraph length', 'good', `Average paragraph is ${Math.round(avgPLength)} words — concise and scannable.`))
    } else {
      score += 1
      checks.push(
        makeCheck(
          'Paragraph length',
          'needs_work',
          `Average paragraph is ${Math.round(avgPLength)} words — too long.`,
          'Break long paragraphs into shorter chunks (under 100 words each). AI models and readers both prefer shorter paragraphs.'
        )
      )
    }
  } else {
    score += 3
    checks.push(makeCheck('Paragraph length', 'good', 'No paragraphs to measure — N/A.'))
  }

  // 6. FAQ / Q&A structure (bonus up to 3 pts, capped at 25 total)
  const hasJsonLdFaq = $('script[type="application/ld+json"]').toArray().some((el) => {
    try {
      const data = JSON.parse($(el).html() || '{}')
      const types = Array.isArray(data) ? data.map((d: { '@type': string }) => d['@type']) : [data['@type']]
      return types.includes('FAQPage')
    } catch {
      return false
    }
  })
  const hasFaqPattern =
    $('[class*="faq"], [id*="faq"], [class*="FAQ"], [id*="FAQ"]').length > 0 ||
    $('details, summary').length > 2
  if (hasJsonLdFaq || hasFaqPattern) {
    score += 3
    checks.push(makeCheck('FAQ / Q&A structure', 'good', 'FAQ or Q&A structure detected — excellent for featured snippets and AI answers.'))
  } else {
    checks.push(
      makeCheck(
        'FAQ / Q&A structure',
        'needs_work',
        'No FAQ or Q&A structure detected.',
        'Add a FAQ section with FAQPage JSON-LD schema. This significantly increases your chance of being cited in AI-generated answers.'
      )
    )
  }

  return { score: Math.min(score, 25), checks }
}

// ─── UNDERSTANDABLE ──────────────────────────────────────────────────────────

function scoreUnderstandable($: cheerio.CheerioAPI): { score: number; checks: Check[] } {
  const checks: Check[] = []
  let score = 0

  // 1. Title tag
  const title = $('title').text().trim()
  if (!title) {
    checks.push(
      makeCheck(
        'Title tag',
        'critical',
        'No title tag found.',
        'Add a descriptive <title> tag (30–60 characters) that clearly describes the page content.'
      )
    )
  } else if (title.length >= 30 && title.length <= 60) {
    score += 5
    checks.push(makeCheck('Title tag', 'good', `Title is ${title.length} chars: "${title.slice(0, 80)}"`))
  } else {
    score += 3
    const hint = title.length < 30 ? 'too short — expand it' : 'too long — may be truncated in search results'
    checks.push(
      makeCheck(
        'Title tag',
        'needs_work',
        `Title is ${title.length} chars (${hint}): "${title.slice(0, 80)}"`,
        'Aim for 30–60 characters. Include your primary keyword and brand name.'
      )
    )
  }

  // 2. Meta description — find first non-empty (WordPress often adds a blank one first)
  const metaDescEl = $('meta[name="description"], meta[name="Description"]').toArray()
    .find(el => ($( el).attr('content') || '').trim().length > 0)
  const metaDesc = metaDescEl ? ($(metaDescEl).attr('content') || '') : ''
  if (!metaDesc) {
    checks.push(
      makeCheck(
        'Meta description',
        'critical',
        'No meta description found.',
        'Add a meta description (120–160 characters) summarising the page. This is often used as the AI answer snippet source.'
      )
    )
  } else if (metaDesc.length >= 120 && metaDesc.length <= 160) {
    score += 5
    checks.push(makeCheck('Meta description', 'good', `Meta description is ${metaDesc.length} chars — ideal length.`))
  } else {
    score += 3
    const hint = metaDesc.length < 120 ? 'too short' : 'too long'
    checks.push(
      makeCheck(
        'Meta description',
        'needs_work',
        `Meta description is ${metaDesc.length} chars (${hint}). Ideal is 120–160.`,
        'Rewrite the meta description to be 120–160 characters. Include a clear call to action and primary keyword.'
      )
    )
  }

  // 3. Open Graph tags
  const ogTitle = $('meta[property="og:title"]').attr('content')
  const ogDesc = $('meta[property="og:description"]').attr('content')
  if (ogTitle && ogDesc) {
    score += 5
    checks.push(makeCheck('Open Graph tags', 'good', 'og:title and og:description are both present.'))
  } else if (ogTitle || ogDesc) {
    score += 3
    const missing = !ogTitle ? 'og:title' : 'og:description'
    checks.push(
      makeCheck(
        'Open Graph tags',
        'needs_work',
        `Missing ${missing}.`,
        'Add both og:title and og:description to improve how your page appears when shared on social platforms and AI tools.'
      )
    )
  } else {
    checks.push(
      makeCheck(
        'Open Graph tags',
        'needs_work',
        'No Open Graph tags found.',
        'Add og:title, og:description, og:image, and og:url to the <head>. These help AI tools understand and preview your content.'
      )
    )
  }

  // 4. Image alt text
  const allImages = $('img').toArray()
  if (allImages.length === 0) {
    score += 5
    checks.push(makeCheck('Image alt text', 'good', 'No images found — N/A.'))
  } else {
    const withAlt = allImages.filter((img) => {
      const alt = $(img).attr('alt')
      return alt !== undefined && alt !== null
    })
    const pct = Math.round((withAlt.length / allImages.length) * 100)
    if (pct === 100) {
      score += 5
      checks.push(makeCheck('Image alt text', 'good', `All ${allImages.length} images have alt text — fully accessible.`))
    } else if (pct >= 50) {
      score += 3
      checks.push(
        makeCheck(
          'Image alt text',
          'needs_work',
          `${pct}% of images (${withAlt.length}/${allImages.length}) have alt text.`,
          'Add descriptive alt text to all images. This helps both accessibility and AI understanding of visual content.'
        )
      )
    } else {
      checks.push(
        makeCheck(
          'Image alt text',
          'critical',
          `Only ${pct}% of images have alt text (${withAlt.length}/${allImages.length}).`,
          'Add descriptive alt text to all images immediately. Missing alt text is an accessibility failure and harms AI content understanding.'
        )
      )
    }
  }

  // 5. lang attribute
  const lang = $('html').attr('lang')
  if (lang) {
    score += 5
    checks.push(makeCheck('Language attribute', 'good', `<html lang="${lang}"> is set — search engines and AI can identify the language.`))
  } else {
    checks.push(
      makeCheck(
        'Language attribute',
        'needs_work',
        'No lang attribute on <html> element.',
        'Add lang="en" (or the appropriate language code) to your <html> tag. This helps AI tools and assistive technologies understand the content language.'
      )
    )
  }

  return { score: Math.min(score, 25), checks }
}

// ─── TRUSTWORTHY ─────────────────────────────────────────────────────────────

function scoreTrustworthy($: cheerio.CheerioAPI): { score: number; checks: Check[] } {
  const checks: Check[] = []
  let score = 0

  const richTypes = [
    'Organization', 'Article', 'Product', 'FAQPage', 'BreadcrumbList',
    'WebSite', 'LocalBusiness', 'Person', 'NewsArticle', 'BlogPosting',
    'ItemList', 'Event', 'Recipe', 'HowTo', 'Review',
  ]

  const ldJsonScripts = $('script[type="application/ld+json"]').toArray()
  let validJsonLd = false
  let invalidJsonLd = false
  const foundTypes: string[] = []
  let hasAuthorInJsonLd = false

  for (const el of ldJsonScripts) {
    try {
      const raw = $(el).html() || ''
      const data = JSON.parse(raw)
      validJsonLd = true
      const entries = Array.isArray(data) ? data : [data]
      for (const entry of entries) {
        const t = entry['@type']
        if (typeof t === 'string' && richTypes.includes(t)) {
          if (!foundTypes.includes(t)) foundTypes.push(t)
        }
        if (Array.isArray(t)) {
          t.forEach((type: string) => {
            if (richTypes.includes(type) && !foundTypes.includes(type)) foundTypes.push(type)
          })
        }
        if (entry.author || entry.publisher) hasAuthorInJsonLd = true
      }
    } catch {
      invalidJsonLd = true
    }
  }

  // 1. JSON-LD schema present & parseable
  if (validJsonLd) {
    score += 7
    checks.push(makeCheck('JSON-LD schema', 'good', `Valid JSON-LD structured data found (${ldJsonScripts.length} script block${ldJsonScripts.length > 1 ? 's' : ''}).`))
  } else if (invalidJsonLd) {
    score += 3
    checks.push(
      makeCheck(
        'JSON-LD schema',
        'needs_work',
        'JSON-LD script tag found but contains invalid JSON.',
        'Fix the JSON syntax in your schema markup. Use https://validator.schema.org to validate it.'
      )
    )
  } else {
    checks.push(
      makeCheck(
        'JSON-LD schema',
        'needs_work',
        'No JSON-LD structured data found.',
        'Add JSON-LD schema markup to your page. Start with WebSite and Organization schemas, then add page-specific types like Article or Product.'
      )
    )
  }

  // 2. Rich schema types
  if (foundTypes.length >= 2) {
    score += 6
    checks.push(makeCheck('Rich schema types', 'good', `${foundTypes.length} schema types detected: ${foundTypes.join(', ')}.`))
  } else if (foundTypes.length === 1) {
    score += 3
    checks.push(
      makeCheck(
        'Rich schema types',
        'needs_work',
        `Only 1 schema type found: ${foundTypes[0]}.`,
        'Add more schema types relevant to your content (e.g., BreadcrumbList, WebSite, Organization). More types = more AI signals.'
      )
    )
  } else {
    checks.push(
      makeCheck(
        'Rich schema types',
        'critical',
        'No recognisable schema types found.',
        'Implement structured data with types like Organization, Article, Product, or FAQPage to signal content authority to AI models.'
      )
    )
  }

  // 3. Author / publisher metadata
  const metaAuthor = $('meta[name="author"]').attr('content')
  if (hasAuthorInJsonLd || metaAuthor) {
    score += 6
    const source = hasAuthorInJsonLd ? 'JSON-LD structured data' : `meta author tag ("${metaAuthor}")`
    checks.push(makeCheck('Author / publisher metadata', 'good', `Author or publisher information found in ${source}.`))
  } else {
    checks.push(
      makeCheck(
        'Author / publisher metadata',
        'needs_work',
        'No author or publisher metadata found.',
        'Add an author or publisher field to your JSON-LD schema, or include a <meta name="author"> tag. This signals E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) to AI models.'
      )
    )
  }

  // 4. Favicon
  const favicon =
    $('link[rel="icon"]').attr('href') ||
    $('link[rel="shortcut icon"]').attr('href') ||
    $('link[rel="apple-touch-icon"]').attr('href')
  if (favicon) {
    score += 6
    checks.push(makeCheck('Favicon', 'good', `Favicon found: ${favicon}`))
  } else {
    checks.push(
      makeCheck(
        'Favicon',
        'needs_work',
        'No favicon found.',
        'Add a favicon with <link rel="icon" href="/favicon.ico">. A favicon is a basic trust signal and improves brand recognition.'
      )
    )
  }

  return { score: Math.min(score, 25), checks }
}

// ─── ROUTE HANDLER ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: { url?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const rawUrl = (body.url || '').trim()
  if (!rawUrl) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  // Normalise URL
  let url = rawUrl
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url
  }

  try {
    new URL(url) // validate
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  try {
    // Fetch raw HTML
    let rawHtml: string
    try {
      rawHtml = await fetchRawHtml(url)
    } catch (err) {
      return NextResponse.json(
        { error: `Could not fetch the URL: ${err instanceof Error ? err.message : 'Unknown error'}` },
        { status: 422 }
      )
    }

    const $raw = cheerio.load(rawHtml)
    const rawBodyText = extractBodyText(cheerio.load(rawHtml))
    const rawWordCount = countWords(rawBodyText)

    // Fetch rendered HTML (Browserless)
    const renderedHtml = await fetchRenderedHtml(url)
    let renderedWordCount = rawWordCount
    let renderingType: 'SSR' | 'CSR' | 'Hybrid' | 'Estimated'
    let $forScoring = $raw

    if (renderedHtml) {
      const $rendered = cheerio.load(renderedHtml)
      const renderedBodyText = extractBodyText(cheerio.load(renderedHtml))
      renderedWordCount = countWords(renderedBodyText)
      $forScoring = $rendered

      const ratio = renderedWordCount / Math.max(rawWordCount, 1)
      if (ratio <= 1.2 && ratio >= 0.8) {
        renderingType = 'SSR'
      } else if (ratio > 2) {
        renderingType = 'CSR'
      } else {
        renderingType = 'Hybrid'
      }
    } else {
      renderingType = 'Estimated'
      // Use raw for scoring
      $forScoring = $raw
    }

    // Score all pillars
    const [findable, quotable, understandable, trustworthy] = await Promise.all([
      scoreFindable(url, $forScoring),
      Promise.resolve(scoreQuotable($forScoring)),
      Promise.resolve(scoreUnderstandable($forScoring)),
      Promise.resolve(scoreTrustworthy($forScoring)),
    ])

    const overallScore = findable.score + quotable.score + understandable.score + trustworthy.score

    const scanResult = {
      id: randomUUID(),
      url,
      overall_score: overallScore,
      findable_score: findable.score,
      quotable_score: quotable.score,
      understandable_score: understandable.score,
      trustworthy_score: trustworthy.score,
      rendering_type: renderingType,
      raw_word_count: rawWordCount,
      rendered_word_count: renderedWordCount,
      checks: {
        findable: findable.checks,
        quotable: quotable.checks,
        understandable: understandable.checks,
        trustworthy: trustworthy.checks,
      },
      created_at: new Date().toISOString(),
    }

    return NextResponse.json(scanResult)
  } catch (err) {
    console.error('Scan error:', err)
    return NextResponse.json(
      { error: `Scan failed: ${err instanceof Error ? err.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
