const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://repository-name-abscan-backend-production.up.railway.app'

export const API = `${API_URL}/api/v1`

export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const json = await res.json()
  return json.data ?? json
}

export function apiUrl(path: string) {
  return `${API}${path}`
}

// Format helpers
export function fmt(n: number | null | undefined, decimals = 2): string {
  if (n == null) return '—'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toFixed(decimals)
}

export function fmtEth(n: number | null | undefined): string {
  if (n == null) return '—'
  if (n >= 1000) return fmt(n, 0) + ' ETH'
  if (n >= 1) return n.toFixed(2) + ' ETH'
  return n.toFixed(4) + ' ETH'
}

export function fmtUsd(n: number | null | undefined): string {
  if (n == null) return '—'
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(1) + 'K'
  return '$' + n.toFixed(0)
}

export function fmtPct(n: number | null | undefined): string {
  if (n == null) return '—'
  const sign = n > 0 ? '+' : ''
  return sign + n.toFixed(1) + '%'
}

export function shortAddr(addr: string): string {
  if (!addr) return ''
  return addr.slice(0, 6) + '…' + addr.slice(-4)
}

export function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return s + 's ago'
  const m = Math.floor(s / 60)
  if (m < 60) return m + 'm ago'
  const h = Math.floor(m / 60)
  if (h < 24) return h + 'h ago'
  return Math.floor(h / 24) + 'd ago'
}
