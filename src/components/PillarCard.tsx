'use client'

import { useState } from 'react'
import type { Check } from '@/lib/types'
import EqualizerViz from './EqualizerViz'
import CheckItem from './CheckItem'

interface PillarCardProps {
  title: string
  subtitle: string
  score: number
  maxScore: number
  checks: Check[]
}

export default function PillarCard({ title, subtitle, score, maxScore, checks }: PillarCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-[#0a1a19] border border-[rgba(13,99,97,0.3)] rounded-[14px] p-6">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3
              className="text-white font-bold text-xl uppercase leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {title}
            </h3>
            <p className="text-white/50 text-sm mt-1 leading-snug">{subtitle}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-white font-bold text-2xl">{score}</span>
              <span className="text-white/40 text-sm">/{maxScore}</span>
            </div>
            <EqualizerViz score={score} maxScore={maxScore} size="md" />
            <svg
              className={`w-5 h-5 text-white/40 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="mt-4 border-t border-white/10">
          {checks.map((check, i) => (
            <div key={i}>
              <CheckItem check={check} />
              {i < checks.length - 1 && <div className="border-t border-white/5" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
