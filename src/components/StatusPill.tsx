import type { CheckStatus } from '@/lib/types'

interface StatusPillProps {
  status: CheckStatus
}

const STYLES: Record<CheckStatus, string> = {
  good: 'bg-green-950 text-collab-green border border-collab-green/30',
  needs_work: 'bg-yellow-950 text-collab-yellow border border-collab-yellow/30',
  critical: 'bg-red-950 text-red-400 border border-red-400/30',
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
