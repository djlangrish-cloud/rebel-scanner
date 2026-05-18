import { supabase } from '@/lib/supabase'
import ScanForm from '@/components/ScanForm'
import EmptyState from '@/components/EmptyState'
import RecentScans from '@/components/RecentScans'

export const revalidate = 0

export default async function Home() {
  const { data: recentScans } = await supabase
    .from('scans')
    .select('id, url, overall_score, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

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
        <EmptyState />
        {recentScans && recentScans.length > 0 && (
          <div className="lg:hidden mt-8">
            <RecentScans scans={recentScans} />
          </div>
        )}
      </div>
    </main>
  )
}
