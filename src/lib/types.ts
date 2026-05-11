export type CheckStatus = 'good' | 'needs_work' | 'critical'

export interface Check {
  name: string
  status: CheckStatus
  detail: string
  fix?: string
}

export interface PillarResult {
  score: number
  maxScore: number
  checks: Check[]
}

export interface ScanResult {
  id: string
  url: string
  overall_score: number
  findable_score: number
  quotable_score: number
  understandable_score: number
  trustworthy_score: number
  rendering_type: 'SSR' | 'CSR' | 'Hybrid' | 'Estimated'
  raw_word_count: number
  rendered_word_count: number
  checks: {
    findable: Check[]
    quotable: Check[]
    understandable: Check[]
    trustworthy: Check[]
  }
  created_at: string
}
