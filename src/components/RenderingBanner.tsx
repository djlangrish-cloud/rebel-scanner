interface RenderingBannerProps {
  renderingType: 'SSR' | 'CSR' | 'Hybrid' | 'Estimated'
  rawWordCount: number
  renderedWordCount: number
}

const TYPE_CONFIG = {
  SSR: {
    badgeClass: 'bg-red-950 text-rebel-red border border-rebel-red/30',
    label: 'SSR',
    heading: 'AI CRAWLERS CAN READ YOUR CONTENT',
    body:
      'Your page is server-rendered — HTML is sent fully formed to the browser. This means AI crawlers like GPTBot and ClaudeBot can read your content directly without executing JavaScript.',
  },
  CSR: {
    badgeClass: 'bg-orange-950 text-orange-400 border border-orange-400/30',
    label: 'CSR',
    heading: 'MOST AI CRAWLERS CAN\'T READ YOUR CONTENT',
    body:
      'Your page relies heavily on client-side JavaScript to render content. Most AI web crawlers do not execute JavaScript, meaning they may see a near-empty page. Consider server-side rendering or static generation for key content.',
  },
  Hybrid: {
    badgeClass: 'bg-yellow-950 text-rebel-yellow border border-rebel-yellow/30',
    label: 'HYBRID',
    heading: 'SOME CONTENT REQUIRES JAVASCRIPT',
    body:
      'Your page appears to mix server-rendered and client-rendered content. Core content is accessible to crawlers, but some sections may be missed by AI crawlers that do not run JavaScript.',
  },
  Estimated: {
    badgeClass: 'bg-yellow-950 text-rebel-yellow border border-rebel-yellow/30',
    label: 'ESTIMATED',
    heading: 'RENDERING UNKNOWN — LIKELY SERVER-RENDERED',
    body:
      'JS rendering detection was not available (Browserless API key not configured). Based on raw HTML analysis, the site appears to be server-rendered. Add a Browserless API key for accurate rendering detection.',
  },
}

export default function RenderingBanner({
  renderingType,
  rawWordCount,
  renderedWordCount,
}: RenderingBannerProps) {
  const config = TYPE_CONFIG[renderingType]

  return (
    <div className="bg-[#160c0c] border border-[rgba(192,57,43,0.3)] rounded-[14px] p-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide border mb-3 ${config.badgeClass}`}
          >
            {config.label}
          </span>
          <h3
            className="text-white font-bold text-base uppercase leading-snug mb-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {config.heading}
          </h3>
          <p className="text-white/50 text-sm leading-relaxed">{config.body}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-white/10">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Raw HTML</p>
          <p className="text-white font-bold text-2xl">{rawWordCount.toLocaleString()}</p>
          <p className="text-white/40 text-xs mt-0.5">words</p>
        </div>
        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1">JS-rendered</p>
          <p className="text-white font-bold text-2xl">{renderedWordCount.toLocaleString()}</p>
          <p className="text-white/40 text-xs mt-0.5">words</p>
        </div>
      </div>
    </div>
  )
}
