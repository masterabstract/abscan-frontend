'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { apiUrl, fetcher, fmtEth, fmtUsd, shortAddr, timeAgo } from '@/lib/api'

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [minPrice, setMinPrice] = useState('')
  const [whaleOnly, setWhaleOnly] = useState(false)
  const [newCount, setNewCount] = useState(0)
  const isFirst = useRef(true)

  async function load(since?: string) {
    const params = new URLSearchParams({ limit: '50' })
    if (since) params.set('since', since)
    if (minPrice) params.set('min_price', minPrice)
    if (whaleOnly) params.set('whale_only', 'true')

    try {
      const res = await fetch(apiUrl(`/sales/live?${params}`))
      const json = await res.json()
      const newSales = json.data || []
      const meta = json.meta || {}

      if (isFirst.current) {
        setSales(newSales)
        isFirst.current = false
      } else if (newSales.length > 0) {
        setSales(prev => [...newSales, ...prev].slice(0, 200))
        setNewCount(n => n + newSales.length)
      }
      if (meta.next_since) setCursor(meta.next_since)
    } catch {}
  }

  useEffect(() => {
    isFirst.current = true
    load()
  }, [minPrice, whaleOnly])

  useEffect(() => {
    const interval = setInterval(() => load(cursor || undefined), 10000)
    return () => clearInterval(interval)
  }, [cursor, minPrice, whaleOnly])

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px' }}>Live Sales</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'var(--green-dim)', borderRadius: '20px', border: '1px solid rgba(0,229,160,0.2)' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', animation: 'pulse-glow 1.5s infinite' }} />
              <span style={{ fontSize: '11px', color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>LIVE</span>
            </div>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: '13px' }}>Real-time NFT sales on Abstract Chain · updates every 10s</p>
        </div>
        {newCount > 0 && (
          <div style={{ padding: '8px 16px', background: 'var(--accent-dim)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '20px', fontSize: '12px', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
            +{newCount} new
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <input
          value={minPrice}
          onChange={e => setMinPrice(e.target.value)}
          placeholder="Min price (ETH)"
          type="number" step="0.01"
          style={{
            padding: '8px 14px', background: 'var(--bg-2)',
            border: '1px solid var(--border)', borderRadius: '10px',
            color: 'var(--text-0)', fontSize: '13px', outline: 'none', width: '160px',
          }}
        />
        <button onClick={() => setWhaleOnly(!whaleOnly)} style={{
          padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border)',
          background: whaleOnly ? 'var(--gold-dim)' : 'var(--bg-2)',
          color: whaleOnly ? 'var(--gold)' : 'var(--text-1)',
          fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
        }}>🐋 Whale Only</button>
      </div>

      {/* Sales Feed */}
      <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 140px 120px 120px 120px',
          padding: '10px 20px', borderBottom: '1px solid var(--border)',
          fontSize: '10px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)',
          textTransform: 'uppercase', letterSpacing: '1px',
        }}>
          <span>Collection / Token</span>
          <span style={{ textAlign: 'right' }}>Price ETH</span>
          <span style={{ textAlign: 'right' }}>Price USD</span>
          <span style={{ textAlign: 'right' }}>Buyer</span>
          <span style={{ textAlign: 'right' }}>Time</span>
        </div>

        {sales.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-2)', fontSize: '14px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📡</div>
            Listening for sales…
          </div>
        ) : sales.map((sale: any, i: number) => (
          <div key={sale.id || i} style={{
            display: 'grid', gridTemplateColumns: '1fr 140px 120px 120px 120px',
            padding: '12px 20px', borderBottom: '1px solid var(--border)',
            alignItems: 'center', transition: 'background 0.15s',
            background: sale.is_whale_sale ? 'rgba(255,209,102,0.03)' : 'transparent',
            animation: i < 5 ? 'slide-up 0.3s ease forwards' : 'none',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
            onMouseLeave={e => (e.currentTarget.style.background = sale.is_whale_sale ? 'rgba(255,209,102,0.03)' : 'transparent')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: 'var(--bg-3)', flexShrink: 0, overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--text-2)',
              }}>
                {sale.collection?.image_url ? <img src={sale.collection.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : sale.collection?.name?.[0]}
              </div>
              <div style={{ minWidth: 0 }}>
                <Link href={`/collection/${sale.collection?.address}`} style={{ fontSize: '13px', fontWeight: 600, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {sale.collection?.name}
                  {sale.is_whale_sale && <span style={{ marginLeft: '6px' }}>🐋</span>}
                </Link>
                <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>
                  Token #{sale.token_id}
                  {sale.rarity_rank && <span style={{ marginLeft: '6px', color: 'var(--gold)' }}>Rank #{sale.rarity_rank}</span>}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: sale.is_whale_sale ? 'var(--gold)' : 'var(--text-0)' }}>
              {fmtEth(sale.price_eth)}
            </div>
            <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-1)', fontFamily: 'var(--font-mono)' }}>
              {fmtUsd(sale.price_usd)}
            </div>
            <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
              {shortAddr(sale.buyer)}
            </div>
            <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-2)' }}>
              {timeAgo(sale.block_timestamp)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
