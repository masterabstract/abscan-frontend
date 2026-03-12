'use client'
import { useState, useEffect, useRef } from 'react'
import useSWR from 'swr'
import { apiUrl, fetcher, fmtEth, fmtUsd, timeAgo, shortAddr } from '@/lib/api'
import Link from 'next/link'

export default function SalesPage() {
  const [whaleOnly, setWhaleOnly] = useState(false)
  const [minPrice, setMinPrice] = useState('')
  const [sales, setSales] = useState<any[]>([])
  const [newCount, setNewCount] = useState(0)
  const cursorRef = useRef<string | null>(null)
  const isFirst = useRef(true)

  const params = new URLSearchParams({ limit: '50' })
  if (whaleOnly) params.set('whale_only', 'true')
  if (minPrice) params.set('min_price', minPrice)

  const { data } = useSWR(apiUrl(`/sales/live?${params}`), fetcher, { refreshInterval: 8000 })

  useEffect(() => {
    if (!data) return
    const incoming = Array.isArray(data) ? data : []
    if (isFirst.current) {
      setSales(incoming)
      if (incoming.length) cursorRef.current = incoming[0]?.block_timestamp ?? null
      isFirst.current = false
    } else {
      const cursor = cursorRef.current
      const fresh = cursor ? incoming.filter((s: any) => s.block_timestamp > cursor) : []
      if (fresh.length) {
        setSales(prev => [...fresh, ...prev].slice(0, 200))
        setNewCount(c => c + fresh.length)
        cursorRef.current = fresh[0].block_timestamp
        setTimeout(() => setNewCount(0), 3000)
      }
    }
  }, [data])

  // Reset on filter change
  useEffect(() => {
    isFirst.current = true
    setSales([])
  }, [whaleOnly, minPrice])

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 60px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cyan)', animation: 'pulse-dot 1.5s infinite', boxShadow: '0 0 8px var(--cyan-glow)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--cyan)', letterSpacing: '0.15em' }}>LIVE</span>
          {newCount > 0 && (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              background: 'var(--cyan-dim)', color: 'var(--cyan)',
              border: '1px solid rgba(0,255,133,0.3)',
              padding: '2px 8px', borderRadius: '3px',
              animation: 'fade-in 0.3s ease',
            }}>+{newCount} NEW</span>
          )}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: 900, color: 'var(--text-0)', letterSpacing: '-0.5px' }}>
          LIVE SALES
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-2)', marginTop: '8px' }}>
          REAL-TIME NFT TRANSACTIONS ON ABSTRACT CHAIN
        </p>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px',
        padding: '14px 18px',
        background: 'var(--bg-1)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', letterSpacing: '0.1em' }}>FILTER:</span>

        <button onClick={() => setWhaleOnly(w => !w)} style={{
          padding: '5px 12px', borderRadius: 'var(--radius)',
          background: whaleOnly ? 'rgba(255,184,0,0.12)' : 'transparent',
          border: `1px solid ${whaleOnly ? 'var(--amber)' : 'var(--border-mid)'}`,
          fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.08em',
          color: whaleOnly ? 'var(--amber)' : 'var(--text-2)',
          cursor: 'pointer', transition: 'all 0.2s',
        }}>
          ◆ WHALE ONLY
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)' }}>MIN</span>
          <input
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            placeholder="0.00"
            style={{
              width: '70px', padding: '5px 8px',
              background: 'var(--bg-2)', border: '1px solid var(--border-mid)',
              borderRadius: 'var(--radius)', color: 'var(--text-0)',
              fontFamily: 'var(--font-mono)', fontSize: '11px', outline: 'none',
              caretColor: 'var(--cyan)',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--border-glow)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border-mid)'}
          />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)' }}>ETH</span>
        </div>

        <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)' }}>
          {sales.length} EVENTS
        </div>
      </div>

      {/* Sales table */}
      <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 140px 120px 120px 100px 80px',
          padding: '10px 20px', borderBottom: '1px solid var(--border)',
          fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 600,
          color: 'var(--text-3)', letterSpacing: '0.15em', background: 'var(--bg-0)',
        }}>
          <span>COLLECTION · TOKEN</span>
          <span style={{ textAlign: 'right' }}>PRICE</span>
          <span style={{ textAlign: 'right' }}>USD</span>
          <span style={{ textAlign: 'right' }}>BUYER</span>
          <span style={{ textAlign: 'right' }}>SELLER</span>
          <span style={{ textAlign: 'right' }}>TIME</span>
        </div>

        {sales.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-3)' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px', color: 'var(--cyan)', animation: 'pulse-dot 2s infinite' }}>◌</div>
            AWAITING TRANSACTIONS…
          </div>
        ) : (
          sales.map((sale: any, i: number) => (
            <SaleRow key={sale.id ?? `${sale.tx_hash}-${i}`} sale={sale} isNew={i < newCount} />
          ))
        )}
      </div>
    </div>
  )
}

function SaleRow({ sale, isNew }: { sale: any; isNew: boolean }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 140px 120px 120px 100px 80px',
      padding: '12px 20px', borderBottom: '1px solid var(--border)',
      alignItems: 'center', transition: 'all 0.15s',
      borderLeft: isNew ? '2px solid var(--cyan)' : '2px solid transparent',
      background: isNew ? 'rgba(0,255,133,0.04)' : 'transparent',
      animation: 'slide-in-left 0.4s ease both',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,133,0.03)'; if (!isNew) e.currentTarget.style.borderLeftColor = 'var(--border-bright)' }}
      onMouseLeave={e => { e.currentTarget.style.background = isNew ? 'rgba(0,255,133,0.04)' : 'transparent'; if (!isNew) e.currentTarget.style.borderLeftColor = 'transparent' }}
    >
      {/* Collection + token */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '4px', flexShrink: 0, overflow: 'hidden', background: 'var(--bg-3)', border: '1px solid var(--border)' }}>
          {sale.collection?.image_url && <img src={sale.collection.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <div style={{ minWidth: 0 }}>
          <Link href={`/collection/${sale.collection?.address}`}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-0)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {sale.collection?.name || '—'}
              {sale.is_whale_sale && <span style={{ color: 'var(--amber)', fontSize: '10px' }}>◆ WHALE</span>}
            </div>
          </Link>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-2)' }}>#{sale.token_id}</div>
        </div>
      </div>

      {/* Price ETH */}
      <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: sale.is_whale_sale ? 'var(--amber)' : 'var(--cyan)', textShadow: sale.is_whale_sale ? '0 0 12px var(--amber-glow)' : '0 0 8px var(--cyan-glow)' }}>
        {fmtEth(sale.price_eth)}
      </div>

      {/* Price USD */}
      <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-2)' }}>
        {fmtUsd(sale.price_usd)}
      </div>

      {/* Buyer */}
      <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-1)' }}>
        {shortAddr(sale.buyer)}
      </div>

      {/* Seller */}
      <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-2)' }}>
        {shortAddr(sale.seller)}
      </div>

      {/* Time */}
      <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)' }}>
        {timeAgo(sale.block_timestamp)}
      </div>
    </div>
  )
}
