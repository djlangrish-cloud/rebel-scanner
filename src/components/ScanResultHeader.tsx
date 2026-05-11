'use client'

import { useState } from 'react'
import type { ScanResult } from '@/lib/types'
import EqualizerViz from './EqualizerViz'

interface ScanResultHeaderProps {
  scan: ScanResult
}

function getScoreColor(score: number): string {
  if (score >= 75) return 'text-collab-green'
  if (score >= 50) return 'text-collab-yellow'
  return 'text-red-400'
}

function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export default function ScanResultHeader({ scan }: ScanResultHeaderProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(scan, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `collab-scan-${getDomain(scan.url)}-${scan.id.slice(0, 8)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-[#0a1a19] border border-[rgba(13,99,97,0.3)] rounded-[14px] p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-collab-green text-xs font-semibold tracking-widest uppercase mb-2">
            SCANNED
          </p>
          <h1
            className="text-white font-bold text-2xl uppercase leading-tight break-all"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {getDomain(scan.url)}
          </h1>
          <p className="text-white/40 text-xs mt-1">{scan.url}</p>
          <p className="text-white/30 text-xs mt-1">{formatTimestamp(scan.created_at)}</p>

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-white/60 hover:text-collab-green transition-colors border border-white/10 hover:border-collab-green/30 rounded-full px-3 py-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copied ? 'COPIED!' : 'COPY LINK'}
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 text-xs text-white/60 hover:text-collab-green transition-colors border border-white/10 hover:border-collab-green/30 rounded-full px-3 py-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              EXPORT JSON
            </button>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          <div className="text-right">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Overall</p>
            <p className={`font-bold text-5xl leading-none ${getScoreColor(scan.overall_score)}`}
               style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {scan.overall_score}
            </p>
            <p className="text-white/30 text-sm">/100</p>
          </div>
          <EqualizerViz score={scan.overall_score} maxScore={100} size="lg" />
        </div>
      </div>
    </div>
  )
}
