import type { Check } from '@/lib/types'
import StatusPill from './StatusPill'

interface CheckItemProps {
  check: Check
}

export default function CheckItem({ check }: CheckItemProps) {
  return (
    <div className="py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-white font-medium text-sm leading-snug">{check.name}</span>
        <StatusPill status={check.status} />
      </div>
      {check.detail && (
        <p className="text-white/50 text-sm mt-1 leading-snug">{check.detail}</p>
      )}
      {check.fix && (
        <div className="rounded-lg bg-white/5 p-3 mt-2">
          <span className="text-collab-green font-bold text-xs uppercase tracking-wide">FIX: </span>
          <span className="text-white/70 text-sm">{check.fix}</span>
        </div>
      )}
    </div>
  )
}
