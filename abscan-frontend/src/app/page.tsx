'use client'
import useSWR from 'swr'
import Link from 'next/link'
import { apiUrl, fetcher, fmtEth, fmtUsd, fmtPct, fmt, timeAgo, shortAddr } from '@/lib/api'
import { Sparkline } from '@/components/charts/Sparkline'

export default function HomePage() {
  const { data, isLoading } = useSWR(apiUrl('/dashboard/home?limit=10'), fetcher, { refreshInterval: 30000 })
  const d = data as any

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Hero */}
      <div style={{ marginBottom: '48px', animation: 'slide-up 0.5s ease forwards' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{
            padding: '4px 10px', background: 'var(--accent-dim)', borderRadius: '20px',
            fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent)',
            border: '1px solid rgba(0,212,255,0.2)',
          }}>ABSTRACT CHAIN · 2741</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', animation: 'pulse-glow 2s infinite' }} />
            <span style={{ fontSize: '11px', color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>LIVE</span>
          </div>
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-2px' }}>
          NFT Analytics<br />
          <span style={{ color: 'var(--accent)' }}>On-Chain.</span> Real-Time.
        </h1>
      </div>

      {/* Market Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '12px', marginBottom: '48px',
      }}>
        {[
          { label: 'Volume 24H', value: fmtUsd(d?.market_stats?.volume_24h_usd), sub: fmtEth(d?.market_stats?.volume_24h_eth) },
          { label: 'Sales 24H', value: fmt(d?.market_stats?.sales_24h, 0), sub: 'transactions' },
          { label: 'Buyers 24H', value: fmt(d?.market_stats?.buyers_24h, 0), sub: 'unique wallets' },
          { label: 'Collections', value: fmt(d?.market_stats?.active_collections, 0), sub: 'active' },
          { label: 'Total Holders', value: fmt(d?.market_stats?.total_holders, 0), sub: 'unique wallets' },
          { label: 'ETH Price', value: d?.market_stats?.eth_price_usd ? '$' + d.market_stats.eth_price_usd.toFixed(0) : '—', sub: 'USD' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'var(--bg-1)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '20px',
            animation: `slide-up ${0.3 + i * 0.05}s ease forwards`,
            transition: 'border-color 0.2s, transform 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
            <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '4px' }}>{isLoading ? '—' : stat.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* Top Collections */}
        <div>
          <SectionHeader title="Top Collections" sub="by 24h volume" href="/collections" />
          <CollectionTable collections={d?.top_collections} isLoading={isLoading} />
        </div>

        {/* Live Sales */}
        <div>
          <SectionHeader title="Live Sales" sub="real-time feed" href="/sales" />
          <LiveSalesFeed />
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ title, sub, href }: { title: string; sub: string; href: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px' }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.5px' }}>{title}</h2>
        <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>{sub}</span>
      </div>
      <Link href={href} style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
        View all →
      </Link>
    </div>
  )
}

function CollectionTable({ collections, isLoading }: { collections?: any[]; isLoading: boolean }) {
  const rows = isLoading ? Array(10).fill(null) : (collections || [])
  return (
    <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '32px 1fr 100px 100px 80px 80px',
        padding: '10px 16px', borderBottom: '1px solid var(--border)',
        fontSize: '10px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px',
      }}>
        <span>#</span><span>Collection</span><span style={{ textAlign: 'right' }}>Floor</span>
        <span style={{ textAlign: 'right' }}>Vol 24H</span><span style={{ textAlign: 'right' }}>Sales</span>
        <span style={{ textAlign: 'right' }}>7D</span>
      </div>
      {rows.map((col: any, i: number) => (
        <CollectionRow key={col?.id ?? i} col={col} rank={i + 1} isLoading={isLoading} />
      ))}
    </div>
  )
}

function CollectionRow({ col, rank, isLoading }: { col: any; rank: number; isLoading: boolean }) {
  if (isLoading || !col) return (
    <div style={{
      display: 'grid', gridTemplateColumns: '32px 1fr 100px 100px 80px 80px',
      padding: '12px 16px', borderBottom: '1px solid var(--border)',
    }}>
      {[32, 160, 60, 60, 40, 60].map((w, i) => (
        <div key={i} style={{ height: '14px', width: w, background: 'var(--bg-3)', borderRadius: '4px', margin: 'auto 0' }} />
      ))}
    </div>
  )

  const change = col.floor_change_24h_pct
  const isUp = change > 0

  return (
    <Link href={`/collection/${col.address}`}>
      <div style={{
        display: 'grid', gridTemplateColumns: '32px 1fr 100px 100px 80px 80px',
        padding: '10px 16px', borderBottom: '1px solid var(--border)',
        alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s',
      }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <span style={{ fontSize: '12px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{rank}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
            background: 'var(--bg-3)', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', color: 'var(--text-2)',
          }}>
            {col.image_url ? <img src={col.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : col.symbol?.[0]}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {col.name}
              {col.is_verified && <span style={{ color: 'var(--accent)', marginLeft: '4px', fontSize: '10px' }}>✓</span>}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>{fmt(col.unique_holders, 0)} holders</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{fmtEth(col.floor_price_eth)}</div>
          <div style={{ fontSize: '11px', color: change == null ? 'var(--text-2)' : isUp ? 'var(--green)' : 'var(--red)' }}>
            {fmtPct(change)}
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          {fmtEth(col.volume_24h_eth)}
        </div>
        <div style={{ textAlign: 'right', fontSize: '13px', color: 'var(--text-1)' }}>
          {fmt(col.sales_24h, 0)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Sparkline data={col.floor_sparkline} width={64} height={28} />
        </div>
      </div>
    </Link>
  )
}

function LiveSalesFeed() {
  const { data } = useSWR(apiUrl('/sales/live?limit=20'), fetcher, { refreshInterval: 10000 })
  const sales = (data as any[]) || []

  return (
    <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', maxHeight: '560px', overflowY: 'auto' }}>
      {sales.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-2)', fontSize: '13px' }}>
          Waiting for sales…
        </div>
      ) : sales.map((sale: any) => (
        <div key={sale.id} style={{
          padding: '12px 14px', borderBottom: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: '6px',
          transition: 'background 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>{sale.collection?.name || '—'}</span>
            <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: sale.is_whale_sale ? 'var(--gold)' : 'var(--text-0)' }}>
              {fmtEth(sale.price_eth)}
              {sale.is_whale_sale && ' 🐋'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
              #{sale.token_id} · {shortAddr(sale.buyer)}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-2)' }}>{timeAgo(sale.block_timestamp)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
