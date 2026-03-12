'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const GECKO_BASE = 'https://api.geckoterminal.com/api/v2'
const NETWORK = 'abstract'

type Pool = {
  id: string
  attributes: {
    name: string
    address: string
    base_token_price_usd: string
    quote_token_price_usd: string
    base_token_price_native_currency: string
    price_change_percentage: { h1: string; h6: string; h24: string }
    transactions: { h24: { buys: number; sells: number } }
    volume_usd: { h1: string; h24: string }
    reserve_in_usd: string
    pool_created_at: string
    fdv_usd: string
    market_cap_usd: string | null
  }
  relationships: {
    base_token: { data: { id: string } }
    quote_token: { data: { id: string } }
    dex: { data: { id: string } }
  }
}

type Token = {
  id: string
  attributes: {
    name: string
    symbol: string
    address: string
    image_url: string | null
    coingecko_coin_id: string | null
    decimals: number
  }
}

type Included = Token | { id: string; type: string; attributes: { name: string } }

function fmt(n: string | number | null | undefined, decimals = 2) {
  if (n == null || n === '') return '—'
  const num = typeof n === 'string' ? parseFloat(n) : n
  if (isNaN(num)) return '—'
  if (num === 0) return '$0'
  if (num < 0.0001) return '<$0.0001'
  if (num < 1) return '$' + num.toFixed(6)
  if (num >= 1_000_000_000) return '$' + (num / 1_000_000_000).toFixed(2) + 'B'
  if (num >= 1_000_000) return '$' + (num / 1_000_000).toFixed(2) + 'M'
  if (num >= 1_000) return '$' + num.toLocaleString('en', { maximumFractionDigits: 2 })
  return '$' + num.toFixed(decimals)
}

function fmtPct(n: string | null | undefined) {
  if (!n) return { label: '—', positive: null }
  const num = parseFloat(n)
  if (isNaN(num)) return { label: '—', positive: null }
  return {
    label: (num >= 0 ? '+' : '') + num.toFixed(2) + '%',
    positive: num >= 0,
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  if (d > 0) return `${d}d ago`
  if (h > 0) return `${h}h ago`
  return 'Recently'
}

export default function TokensPage() {
  const [pools, setPools] = useState<Pool[]>([])
  const [included, setIncluded] = useState<Included[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'trending' | 'new' | 'top'>('trending')
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Pool[]>([])
  const [searching, setSearching] = useState(false)

  const fetchPools = useCallback(async (type: 'trending' | 'new' | 'top') => {
    setLoading(true)
    setError(null)
    try {
      const endpoint = type === 'trending'
        ? `${GECKO_BASE}/networks/${NETWORK}/trending_pools?include=base_token,quote_token,dex&page=1`
        : type === 'new'
        ? `${GECKO_BASE}/networks/${NETWORK}/new_pools?include=base_token,quote_token,dex&page=1`
        : `${GECKO_BASE}/networks/${NETWORK}/pools?include=base_token,quote_token,dex&page=1`
      const res = await fetch(endpoint, { headers: { 'Accept': 'application/json' } })
      if (!res.ok) throw new Error('API error')
      const json = await res.json()
      setPools(json.data || [])
      setIncluded(json.included || [])
    } catch (e) {
      setError('Unable to load token data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPools(tab) }, [tab, fetchPools])

  useEffect(() => {
    if (search.length < 2) { setSearchResults([]); return }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(
          `${GECKO_BASE}/search/pools?query=${encodeURIComponent(search)}&network=${NETWORK}&include=base_token,quote_token,dex&page=1`,
          { headers: { 'Accept': 'application/json' } }
        )
        const json = await res.json()
        setSearchResults(json.data || [])
        setIncluded(prev => [...prev, ...(json.included || [])])
      } catch {}
      finally { setSearching(false) }
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const getToken = (id: string): Token | null => {
    const t = included.find(i => i.id === id && (i as any).type === 'token')
    return t ? t as Token : null
  }

  const getDex = (id: string): string => {
    const d = included.find(i => i.id === id)
    return d ? (d as any).attributes?.name || id : id
  }

  const displayPools = search.length >= 2 ? searchResults : pools

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', paddingTop: '80px' }}>
      {/* Header */}
      <div style={{ padding: '32px 24px 0', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent), #0088ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px',
          }}>⬡</div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>
            Token Explorer
          </h1>
        </div>
        <p style={{ color: 'var(--text-2)', fontSize: '14px', margin: '0 0 28px' }}>
          Real-time DEX pools & token data on Abstract Chain · Powered by GeckoTerminal
        </p>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '480px', marginBottom: '24px' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search token or pool address…"
            style={{
              width: '100%', padding: '10px 16px 10px 40px',
              background: 'var(--bg-2)', border: '1px solid var(--border)',
              borderRadius: '12px', color: 'var(--text-0)', fontSize: '14px',
              outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}
            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          {searching && (
            <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '12px' }}>
              …
            </div>
          )}
        </div>

        {/* Tabs */}
        {search.length < 2 && (
          <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
            {(['trending', 'top', 'new'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '7px 18px', borderRadius: '8px', border: 'none',
                cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                background: tab === t ? 'var(--accent)' : 'var(--bg-2)',
                color: tab === t ? '#000' : 'var(--text-1)',
                transition: 'all 0.2s', textTransform: 'capitalize',
              }}>{t === 'trending' ? '🔥 Trending' : t === 'top' ? '👑 Top Pools' : '✨ New'}</button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ padding: '0 24px 60px', maxWidth: '1400px', margin: '0 auto' }}>
        {error ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-2)' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
            <div>{error}</div>
            <button onClick={() => fetchPools(tab)} style={{
              marginTop: '16px', padding: '8px 20px', background: 'var(--accent)',
              color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
            }}>Retry</button>
          </div>
        ) : loading ? (
          <div style={{ display: 'grid', gap: '8px' }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{
                height: '60px', borderRadius: '12px', background: 'var(--bg-2)',
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.05}s`,
              }} />
            ))}
          </div>
        ) : displayPools.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-2)' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
            <div>No results found</div>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 120px 120px 120px 120px 100px 80px',
              padding: '8px 16px', marginBottom: '4px',
              fontSize: '11px', fontWeight: 700, color: 'var(--text-2)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              gap: '8px',
            }}>
              <span>#</span>
              <span>Pool / Token</span>
              <span style={{ textAlign: 'right' }}>Price</span>
              <span style={{ textAlign: 'right' }}>1H %</span>
              <span style={{ textAlign: 'right' }}>24H %</span>
              <span style={{ textAlign: 'right' }}>Vol 24H</span>
              <span style={{ textAlign: 'right' }}>Liquidity</span>
              <span style={{ textAlign: 'right' }}>Age</span>
            </div>

            {/* Rows */}
            {displayPools.map((pool, idx) => {
              const baseId = pool.relationships.base_token?.data?.id
              const quoteId = pool.relationships.quote_token?.data?.id
              const dexId = pool.relationships.dex?.data?.id
              const baseToken = baseId ? getToken(baseId) : null
              const dex = dexId ? getDex(dexId) : ''
              const p1h = fmtPct(pool.attributes.price_change_percentage?.h1)
              const p24h = fmtPct(pool.attributes.price_change_percentage?.h24)

              return (
                <a
                  key={pool.id}
                  href={`https://www.geckoterminal.com/${NETWORK}/pools/${pool.attributes.address}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 120px 120px 120px 120px 100px 80px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    marginBottom: '4px',
                    background: 'var(--bg-1)',
                    border: '1px solid var(--border)',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'background 0.15s, border-color 0.15s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--bg-2)'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border-bright)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--bg-1)'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                  }}
                >
                  {/* Rank */}
                  <span style={{ fontSize: '13px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
                    {idx + 1}
                  </span>

                  {/* Token info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                      background: 'var(--bg-3)', overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 700, color: 'var(--accent)',
                    }}>
                      {baseToken?.attributes.image_url
                        ? <img src={baseToken.attributes.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : (baseToken?.attributes.symbol?.[0] || '?')}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {pool.attributes.name}
                        </span>
                        <span style={{
                          fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                          background: 'var(--bg-3)', color: 'var(--text-2)', fontFamily: 'var(--font-mono)',
                          whiteSpace: 'nowrap',
                        }}>{dex}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                        {pool.attributes.address.slice(0, 6)}…{pool.attributes.address.slice(-4)}
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}>
                    {fmt(pool.attributes.base_token_price_usd, 6)}
                  </div>

                  {/* 1H */}
                  <div style={{
                    textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600,
                    color: p1h.positive === null ? 'var(--text-2)' : p1h.positive ? '#00d97e' : '#ff4d6d',
                  }}>
                    {p1h.label}
                  </div>

                  {/* 24H */}
                  <div style={{
                    textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600,
                    color: p24h.positive === null ? 'var(--text-2)' : p24h.positive ? '#00d97e' : '#ff4d6d',
                  }}>
                    {p24h.label}
                  </div>

                  {/* Volume */}
                  <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-1)' }}>
                    {fmt(pool.attributes.volume_usd?.h24)}
                  </div>

                  {/* Liquidity */}
                  <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-1)' }}>
                    {fmt(pool.attributes.reserve_in_usd)}
                  </div>

                  {/* Age */}
                  <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-2)' }}>
                    {pool.attributes.pool_created_at ? timeAgo(pool.attributes.pool_created_at) : '—'}
                  </div>
                </a>
              )
            })}

            <div style={{ textAlign: 'center', padding: '24px', fontSize: '12px', color: 'var(--text-2)' }}>
              Data via GeckoTerminal · Clicking a row opens the pool on GeckoTerminal
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1 }
          50% { opacity: 0.4 }
        }
      `}</style>
    </div>
  )
}
