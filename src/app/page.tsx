import type { Metadata } from 'next'
import Link from 'next/link'
import EmptyState from '@/components/EmptyState'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Rebel AI Scanner — Free AI Search Readiness Audit',
  description: 'Find out how AI search engines read your website. Free scan in seconds. Scored on 20 checks covering findability, quotability, understandability and trustworthiness.',
  openGraph: {
    title: 'Rebel AI Scanner — Free AI Search Readiness Audit',
    description: 'Find out how AI search engines read your website. Free. No account needed.',
    url: 'https://scanner.rebelmarketer.co.uk',
    siteName: 'Rebel AI Scanner',
    type: 'website',
  },
}

const toolSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Rebel AI Scanner',
  url: 'https://scanner.rebelmarketer.co.uk',
  description: 'Free AI search readiness audit. Scans any website and scores it across findability, quotability, understandability and trustworthiness.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'GBP',
  },
  author: {
    '@type': 'Person',
    name: 'Dan Langrish',
    url: 'https://rebelmarketer.co.uk',
  },
}

export default function Home() {
  return (
    <main className="min-h-screen bg-rebel-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />

      <header className="px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="flex items-center gap-2 w-fit hover:opacity-80 transition-opacity">
            <span
              className="font-bold text-white text-xl uppercase"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              REBEL
            </span>
            <span className="text-rebel-red text-xs font-semibold tracking-widest uppercase">
              AI SCANNER
            </span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <EmptyState />
      </div>

      <Footer />
    </main>
  )
}
