import Link from 'next/link'
import ScanForm from '@/components/ScanForm'
import EmptyState from '@/components/EmptyState'

export default function Home() {
  return (
    <main className="min-h-screen bg-rebel-black">
      <header className="sticky top-0 z-50 bg-rebel-black border-b border-rebel-darkred/20 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
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
          <ScanForm />
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <EmptyState />
      </div>
    </main>
  )
}
