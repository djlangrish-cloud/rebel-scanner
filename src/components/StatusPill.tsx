import type { CheckStatus } from '@/lib/types'

interface StatusPillProps {
  status: CheckStatus
}

const STYLES: Record<CheckStatus, string> = {
  good: 'bg-red-950 text-rebel-red border border-rebel-red/30',
  needs_work: 'bg-yellow-950 text-rebel-yellow border border-rebel-yellow/30',
  critical: 'bg-orange-950 text-orange-400 border border-orange-400/30',
}

const LABELS: Record<CheckStatus, string> = {
  good: 'GOOD',
  needs_work: 'NEEDS WORK',
  critical: 'CRITICAL',
}

export default function StatusPill({ status }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  )
}
