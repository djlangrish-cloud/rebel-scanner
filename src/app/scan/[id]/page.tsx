import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import ScanForm from '@/components/ScanForm'
import ScanResultHeader from '@/components/ScanResultHeader'
import RenderingBanner from '@/components/RenderingBanner'
import PillarCard from '@/components/PillarCard'
import RecentScans from '@/components/RecentScans'
import Link from 'next/link'

export const revalidate = 0

export default async function ScanPage({ params }: { params: { id: string } }) {
  const [{ data: scan }, { data: recentScans }] = await Promise.all([
    supabase.from('scans').select('*').eq('id', params.id).single(),
    supabase
      .from('scans')
      .select('id, url, overall_score, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  if (!scan) notFound()

  return (
    <main className="min-h-screen bg-rebel-black">
      <header className="sticky top-0 z-50 bg-rebel-black border-b border-rebel-darkred/20 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="font-bold text-white text-xl uppercase"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              REBEL
            </span>
            <span className="text-rebel-red text-xs font-semibold tracking-widest uppercase">
              AI SCANNER
            </span>
          </div>
          <ScanForm />
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-6 py-8 relative">
        <div className="absolute top-8 right-6 hidden lg:block">
          <RecentScans scans={recentScans || []} />
        </div>
        <Link
          href="/"
          className="flex items-center gap-1 text-white/60 hover:text-white text-sm mb-6 w-fit transition-colors"
        >
          ← NEW SCAN
        </Link>
        <div className="space-y-4 max-w-2xl">
          <ScanResultHeader scan={scan} />
          <RenderingBanner
            renderingType={scan.rendering_type}
            rawWordCount={scan.raw_word_count}
            renderedWordCount={scan.rendered_word_count}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PillarCard
              title="FINDABLE"
              subtitle="Can crawlers reach your content?"
              score={scan.findable_score}
              maxScore={25}
              checks={scan.checks.findable}
            />
            <PillarCard
              title="QUOTABLE"
              subtitle="Is your content easy to extract and cite?"
              score={scan.quotable_score}
              maxScore={25}
              checks={scan.checks.quotable}
            />
            <PillarCard
              title="UNDERSTANDABLE"
              subtitle="Is the page semantically clear?"
              score={scan.understandable_score}
              maxScore={25}
              checks={scan.checks.understandable}
            />
            <PillarCard
              title="TRUSTWORTHY"
              subtitle="Are authority signals present?"
              score={scan.trustworthy_score}
              maxScore={25}
              checks={scan.checks.trustworthy}
            />
          </div>
        </div>
        {recentScans && recentScans.length > 0 && (
          <div className="lg:hidden mt-8 max-w-2xl">
            <RecentScans scans={recentScans} />
          </div>
        )}
      </div>
    </main>
  )
}
