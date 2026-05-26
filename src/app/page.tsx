import Link from 'next/link'
import EmptyState from '@/components/EmptyState'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-rebel-black">
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
