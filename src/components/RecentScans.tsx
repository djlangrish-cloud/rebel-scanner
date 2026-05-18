import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface RecentScan {
  id: string
  url: string
  overall_score: number
  created_at: string
}

interface RecentScansProps {
  scans: RecentScan[]
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function getScoreColor(score: number): string {
  if (score >= 75) return 'text-rebel-red'
  if (score >= 50) return 'text-rebel-yellow'
  return 'text-orange-400'
}

export default function RecentScans({ scans }: RecentScansProps) {
  if (!scans || scans.length === 0) return null

  return (
    <div className="w-56 bg-[#160c0c] border border-[rgba(192,57,43,0.3)] rounded-[14px] p-4">
      <p className="text-white/40 text-xs font-semibold tracking-widest uppercase mb-3">
        RECENT SCANS
      </p>
      <div className="space-y-1">
        {scans.map((scan) => {
          let timeAgo = ''
          try {
            timeAgo = formatDistanceToNow(new Date(scan.created_at), { addSuffix: true })
          } catch {
            timeAgo = ''
          }

          return (
            <Link
              key={scan.id}
              href={`/scan/${scan.id}`}
              className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate group-hover:text-rebel-red transition-colors">
                  {getDomain(scan.url)}
                </p>
                <p className="text-white/30 text-xs">{timeAgo}</p>
              </div>
              <span className={`text-sm font-bold shrink-0 ${getScoreColor(scan.overall_score)}`}
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {scan.overall_score}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
