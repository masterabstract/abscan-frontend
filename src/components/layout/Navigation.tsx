'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { apiUrl, fetcher } from '@/lib/api'
import useSWR from 'swr'

export function Navigation() {
  const pathname = usePathname()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (search.length < 2) { setResults([]); return }
    const timer = setTimeout(async () => {
      try {
        const data = await fetcher<any[]>(apiUrl(`/collections/search?q=${encodeURIComponent(search)}&limit=6`))
        setResults(Array.isArray(data) ? data : [])
      } catch { setResults([]) }
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: '64px',
      background: scrolled ? 'rgba(3,5,8,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'all 0.3s ease',
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: '32px',
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div style={{
          width: '32px', height: '32px',
          background: 'linear-gradient(135deg, var(--accent), #0088ff)',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: 800, color: '#000',
          fontFamily: 'var(--font-mono)',
        }}>AT</div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px' }}>
<span style={{ color: 'var(--accent)' }}>ABS</span>TRACK
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {[
          { href: '/', label: 'Dashboard' },
          { href: '/collections', label: 'Collections' },
          { href: '/sales', label: 'Live Sales' },
        ].map(({ href, label }) => (
          <Link key={href} href={href} style={{
            padding: '6px 14px', borderRadius: '8px',
            fontSize: '13px', fontWeight: 500,
            color: pathname === href ? 'var(--accent)' : 'var(--text-1)',
            background: pathname === href ? 'var(--accent-dim)' : 'transparent',
            transition: 'all 0.2s',
          }}>{label}</Link>
        ))}
      </div>

      {/* Search */}
      <div style={{ flex: 1, maxWidth: '360px', position: 'relative' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search collections…"
          style={{
            width: '100%', padding: '8px 14px 8px 36px',
            background: 'var(--bg-2)', border: '1px solid var(--border)',
            borderRadius: '10px', color: 'var(--text-0)',
            fontSize: '13px', outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; setTimeout(() => setResults([]), 200) }}
        />
        <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        {results.length > 0 && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
            background: 'var(--bg-2)', border: '1px solid var(--border-bright)',
            borderRadius: '12px', overflow: 'hidden', zIndex: 200,
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}>
            {results.map((r: any) => (
              <Link key={r.id} href={`/collection/${r.address}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--border)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-3)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'var(--bg-4)', flexShrink: 0, overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', color: 'var(--text-2)',
                }}>
                  {r.image_url ? <img src={r.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : r.symbol?.[0]}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
                    {r.floor_price_eth ? r.floor_price_eth.toFixed(3) + ' ETH' : ''}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ETH Price */}
      <EthPrice />
    </nav>
  )
}

function EthPrice() {
  const { data } = useSWR(apiUrl('/dashboard/home?limit=1'), fetcher, { refreshInterval: 30000 })
  const price = (data as any)?.market_stats?.eth_price_usd
  return (
    <div style={{
      marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px',
      padding: '6px 12px', background: 'var(--bg-2)', borderRadius: '8px',
      border: '1px solid var(--border)',
    }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-glow 2s infinite' }} />
      <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>ETH</span>
      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-0)' }}>
        {price ? '$' + price.toLocaleString('en', { maximumFractionDigits: 0 }) : '…'}
      </span>
    </div>
  )
}
