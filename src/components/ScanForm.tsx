'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function ScanForm() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    let target = url.trim()
    if (!target) return

    // Prepend https if missing
    if (!/^https?:\/\//i.test(target)) {
      target = 'https://' + target
    }

    setLoading(true)
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Scan failed')
      }

      router.push(`/scan/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="flex-1">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 12a7.5 7.5 0 0012.15 4.65z" />
            </svg>
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourwebsite.com"
            disabled={loading}
            className="w-full bg-[#111] border border-[rgba(13,99,97,0.3)] rounded-full pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-collab-green/50 transition-colors disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="bg-collab-green text-black font-bold rounded-full px-5 py-2.5 text-sm hover:bg-collab-green/90 transition-colors disabled:opacity-50 shrink-0 uppercase tracking-wide"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3-3-3h4z" />
              </svg>
              SCANNING...
            </span>
          ) : (
            'SCAN'
          )}
        </button>
      </form>
      {error && (
        <p className="text-red-400 text-xs mt-2 pl-4">{error}</p>
      )}
    </div>
  )
}
