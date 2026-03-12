'use client'
import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { apiUrl, fetcher, fmtEth, fmtUsd, fmtPct, fmt } from '@/lib/api'
import { Sparkline } from '@/components/charts/Sparkline'

const SORT_OPTIONS = [
  { value: 'volume_24h', label: 'Vol 24H' },
  { value: 'volume_7d', label: 'Vol 7D' },
  { value: 'volume_total', label: 'Vol Total' },
  { value: 'floor_price', label: 'Floor' },
  { value: 'market_cap', label: 'Market Cap' },
  { value: 'holders', label: 'Holders' },
  { value: 'trending', label: 'Trending' },
]

export default function CollectionsPage() {
  const [sort, setSort] = useState('volume_24h')
  const [search, setSearch] = useState('')
  const [offset, setOffset] = useState(0)
  const limit = 25

  const params = new URLSearchParams({ sort, limit: String(limit), offset: String(offset) })
  if (search) params.set('search', search)

  const { data, isLoading } = useSWR(apiUrl(`/collections?${params}`), fetcher, { refreshInterval: 60000 })
  const collections = (data as any[]) || []

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '4px' }}>Collections</h1>
        <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>All NFT collections on Abstract Chain</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setOffset(0) }}
          placeholder="Search…"
          style={{
            padding: '8px 14px', background: 'var(--bg-2)',
            border: '1px solid var(--border)', borderRadius: '10px',
            color: 'var(--text-0)', fontSize: '13px', outline: 'none', width: '200px',
          }}
        />
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '4px' }}>
          {SORT_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => { setSort(opt.value); setOffset(0) }} style={{
              padding: '5px 12px', borderRadius: '7px', border: 'none',
              background: sort === opt.value ? 'var(--accent-dim)' : 'transparent',
              color: sort === opt.value ? 'var(--accent)' : 'var(--text-1)',
              fontSize: '12px', fontWeight: 500, transition: 'all 0.2s', cursor: 'pointer',
            }}>{opt.label}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr 110px 120px 120px 90px 90px 80px',
          padding: '10px 20px', borderBottom: '1px solid var(--border)',
          fontSize: '10px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)',
          textTransform: 'uppercase', letterSpacing: '1px',
        }}>
          <span>#</span><span>Collection</span>
          <span style={{ textAlign: 'right' }}>Floor</span>
          <span style={{ textAlign: 'right' }}>Vol 24H</span>
          <span style={{ textAlign: 'right' }}>Vol 7D</span>
          <span style={{ textAlign: 'right' }}>Sales</span>
          <span style={{ textAlign: 'right' }}>Holders</span>
          <span style={{ textAlign: 'right' }}>7D Chart</span>
        </div>

        {isLoading ? Array(25).fill(null).map((_, i) => <SkeletonRow key={i} />) :
          collections.map((col: any, i: number) => (
            <Link key={col.id} href={`/collection/${col.address}`}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 110px 120px 120px 90px 90px 80px',
                padding: '12px 20px', borderBottom: '1px solid var(--border)',
                alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: '12px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
                  {offset + i + 1}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                    background: 'var(--bg-3)', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', color: 'var(--text-2)',
                  }}>
                    {col.image_url ? <img src={col.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : col.symbol?.[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>
                      {col.name}
                      {col.is_verified && <span style={{ color: 'var(--accent)', marginLeft: '5px', fontSize: '10px' }}>✓</span>}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>{col.symbol}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{fmtEth(col.floor_price_eth)}</div>
                  <div style={{ fontSize: '11px', color: col.floor_change_24h_pct > 0 ? 'var(--green)' : col.floor_change_24h_pct < 0 ? 'var(--red)' : 'var(--text-2)' }}>
                    {fmtPct(col.floor_change_24h_pct)}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{fmtEth(col.volume_24h_eth)}</div>
                <div style={{ textAlign: 'right', fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>{fmtEth(col.volume_7d_eth)}</div>
                <div style={{ textAlign: 'right', fontSize: '13px', color: 'var(--text-1)' }}>{fmt(col.sales_24h, 0)}</div>
                <div style={{ textAlign: 'right', fontSize: '13px', color: 'var(--text-1)' }}>{fmt(col.unique_holders, 0)}</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Sparkline data={col.floor_sparkline} width={72} height={32} />
                </div>
              </div>
            </Link>
          ))}
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
        <button onClick={() => setOffset(Math.max(0, offset - limit))} disabled={offset === 0} style={{
          padding: '8px 20px', borderRadius: '8px', border: '1px solid var(--border)',
          background: 'var(--bg-2)', color: offset === 0 ? 'var(--text-2)' : 'var(--text-0)',
          cursor: offset === 0 ? 'not-allowed' : 'pointer', fontSize: '13px',
        }}>← Prev</button>
        <button onClick={() => setOffset(offset + limit)} disabled={collections.length < limit} style={{
          padding: '8px 20px', borderRadius: '8px', border: '1px solid var(--border)',
          background: 'var(--bg-2)', color: 'var(--text-0)', cursor: 'pointer', fontSize: '13px',
        }}>Next →</button>
      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '40px 1fr 110px 120px 120px 90px 90px 80px',
      padding: '14px 20px', borderBottom: '1px solid var(--border)',
    }}>
      {[20, 180, 70, 80, 80, 40, 50, 64].map((w, i) => (
        <div key={i} style={{ height: '14px', width: w, background: 'var(--bg-3)', borderRadius: '4px' }} />
      ))}
    </div>
  )
}
