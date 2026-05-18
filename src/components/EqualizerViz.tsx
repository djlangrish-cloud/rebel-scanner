'use client'

const HEIGHTS = {
  lg: [35, 50, 62, 72, 80, 85, 80, 72, 62, 50, 35, 25],
  md: [30, 45, 58, 68, 58, 45, 30, 22],
  sm: [25, 38, 50, 38, 25, 18],
}

const SIZES = {
  lg: { barWidth: 6, gap: 4, containerW: 120 },
  md: { barWidth: 5, gap: 3, containerW: 80 },
  sm: { barWidth: 4, gap: 3, containerW: 60 },
}

interface EqualizerVizProps {
  score: number
  maxScore: number
  size: 'lg' | 'md' | 'sm'
}

export default function EqualizerViz({ score, maxScore, size }: EqualizerVizProps) {
  const heights = HEIGHTS[size]
  const { barWidth, gap, containerW } = SIZES[size]
  const barCount = heights.length
  const maxH = Math.max(...heights)
  const containerH = maxH + 4

  const clampedScore = Math.max(0, Math.min(score, maxScore))
  const activeCount = Math.round((clampedScore / maxScore) * barCount)

  return (
    <div
      style={{ width: containerW, height: containerH, flexShrink: 0 }}
      className="flex items-end"
      aria-label={`Score visualization: ${score}/${maxScore}`}
    >
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            width: barWidth,
            height: h,
            marginRight: i < barCount - 1 ? gap : 0,
            borderRadius: '999px',
            backgroundColor: i < activeCount ? '#e74c3c' : 'rgba(192,57,43,0.35)',
            transition: 'background-color 0.3s ease',
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  )
}
