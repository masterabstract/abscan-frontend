'use client'

interface SparklineProps {
  data?: number[] | null
  width?: number
  height?: number
  color?: string
}

export function Sparkline({ data, width = 80, height = 32, color }: SparklineProps) {
  if (!data || data.length < 2) {
    return <div style={{ width, height, opacity: 0.2 }}>
      <svg width={width} height={height}><line x1="0" y1={height/2} x2={width} y2={height/2} stroke="#fff" strokeWidth="1" strokeDasharray="2,2"/></svg>
    </div>
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pad = 2

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2)
    const y = pad + ((1 - (v - min) / range) * (height - pad * 2))
    return `${x},${y}`
  }).join(' ')

  const isUp = data[data.length - 1] >= data[0]
  const lineColor = color || (isUp ? 'var(--green)' : 'var(--red)')
  const gradId = `grad-${Math.random().toString(36).slice(2)}`

  const firstPoint = points.split(' ')[0]
  const lastPoint = points.split(' ')[points.split(' ').length - 1]
  const areaPoints = `${firstPoint.split(',')[0]},${height} ${points} ${lastPoint.split(',')[0]},${height}`

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradId})`} />
      <polyline points={points} fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
