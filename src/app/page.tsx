'use client'
import useSWR from 'swr'
import Link from 'next/link'
import { apiUrl, fetcher, fmtEth, fmtUsd, fmtPct, fmt, timeAgo, shortAddr } from '@/lib/api'
import { Sparkline } from '@/components/charts/Sparkline'

export default function HomePage() {
  const { data, isLoading } = useSWR(apiUrl('/dashboard/home?limit=10'), fetcher, { refreshInterval: 30000 })
  const d = data as any

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '32px 24px 60px' }}>

      {/* ── Hero ── */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <span className="tag tag-cyan">ABSTRACT CHAIN · 2741</span>
          <span className="tag tag-green">● INDEXING LIVE</span>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(52px, 7vw, 96px)',
          fontWeight: 900,
          lineHeight: 0.92,
          letterSpacing: '-1px',
          animation: 'slide-up 0.5s ease forwards',
        }}>
          <span style={{ display: 'block', color: 'var(--text-0)' }}>NFT MARKET</span>
          <span style={{ display: 'block', color: 'var(--cyan)', textShadow: '0 0 40px var(--cyan-glow)', animation: 'flicker 8s ease infinite' }}>INTELLIGENCE</span>
        </h1>
        <p style={{
          marginTop: '16px', fontSize: '14px', color: 'var(--text-2)',
          fontFamily: 'var(--font-mono)', letterSpacing: '0.05em',
          animation: 'slide-up 0.6s ease forwards',
        }}>
          ON-CHAIN · REAL-TIME · ABSTRACT
        </p>
      </div>

      {/* ── Stats grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '1px',
        marginBottom: '40px',
        background: 'var(--border)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}>
        {[
          { label: 'VOL 24H', value: fmtUsd(d?.market_stats?.volume_24h_usd), sub: fmtEth(d?.market_stats?.volume_24h_eth), accent: true },
          { label: 'SALES 24H', value: fmt(d?.market_stats?.sales_24h, 0), sub: 'transactions' },
          { label: 'BUYERS 24H', value: fmt(d?.market_stats?.buyers_24h, 0), sub: 'unique wallets' },
          { label: 'COLLECTIONS', value: fmt(d?.market_stats?.active_collections, 0), sub: 'active' },
          { label: 'HOLDERS', value: fmt(d?.market_stats?.total_holders, 0), sub: 'unique wallets' },
          { label: 'ETH PRICE', value: d?.market_stats?.eth_price_usd ? '$' + d.market_stats.eth_price_usd.toLocaleString('en', { maximumFractionDigits: 0 }) : '···', sub: 'USD · COINGECKO', accent: false },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'var(--bg-1)',
            padding: '24px 20px',
            position: 'relative',
            animation: `slide-up ${0.3 + i * 0.06}s ease forwards`,
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 600,
              color: 'var(--text-3)', letterSpacing: '0.15em',
              marginBottom: '12px',
            }}>{stat.label}</div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800,
              color: stat.accent ? 'var(--cyan)' : 'var(--text-0)',
              letterSpacing: '-0.5px', lineHeight: 1,
              marginBottom: '6px',
              textShadow: stat.accent ? '0 0 20px var(--cyan-glow)' : 'none',
            }}>
              {isLoading ? <Skeleton width={80} height={28} /> : stat.value}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              color: 'var(--text-2)',
            }}>{stat.sub}</div>
            {i < 5 && <div style={{
              position: 'absolute', right: 0, top: '20%', bottom: '20%',
              width: '1px', background: 'var(--border)',
            }} />}
          </div>
        ))}
      </div>

      {/* ── Main content ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>

        {/* Collections table */}
        <div>
          <SectionHeader title="TOP COLLECTIONS" sub="ranked by 24h volume" href="/collections" />
          <CollectionTable collections={d?.top_collections} isLoading={isLoading} />
        </div>

        {/* Live sales */}
        <div>
          <SectionHeader title="LIVE SALES" sub="real-time feed" href="/sales" />
          <LiveSalesFeed />
        </div>
      </div>
    </div>
  )
}

function Skeleton({ width, height }: { width: number; height: number }) {
  return (
    <div style={{
      width, height,
      background: 'var(--bg-4)',
      borderRadius: '3px',
      animation: 'skeleton 1.5s ease infinite',
    }} />
  )
}

function SectionHeader({ title, sub, href }: { title: string; sub: string; href: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      marginBottom: '12px', paddingBottom: '12px',
      borderBottom: '1px solid var(--border)',
    }}>
      <div>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800,
          letterSpacing: '0.05em', color: 'var(--text-0)',
        }}>{title}</h2>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-2)', letterSpacing: '0.08em' }}>
          {sub}
        </span>
      </div>
      <Link href={href} style={{
        fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--cyan)',
        letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '4px',
        transition: 'opacity 0.2s',
      }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        VIEW ALL ›
      </Link>
    </div>
  )
}

function CollectionTable({ collections, isLoading }: { collections?: any[]; isLoading: boolean }) {
  const rows = isLoading ? Array(10).fill(null) : (collections || [])
  return (
    <div style={{
      background: 'var(--bg-1)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '36px 1fr 110px 110px 70px 80px',
        padding: '10px 16px',
        borderBottom: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 600,
        color: 'var(--text-3)', letterSpacing: '0.15em',
        background: 'var(--bg-0)',
      }}>
        <span>#</span>
        <span>COLLECTION</span>
        <span style={{ textAlign: 'right' }}>FLOOR</span>
        <span style={{ textAlign: 'right' }}>VOL 24H</span>
        <span style={{ textAlign: 'right' }}>SALES</span>
        <span style={{ textAlign: 'right' }}>7D TREND</span>
      </div>
      {rows.map((col: any, i: number) => (
        <CollectionRow key={col?.id ?? i} col={col} rank={i + 1} isLoading={!col} />
      ))}
    </div>
  )
}

function CollectionRow({ col, rank, isLoading }: { col: any; rank: number; isLoading: boolean }) {
  if (isLoading || !col) return (
    <div style={{
      display: 'grid', gridTemplateColumns: '36px 1fr 110px 110px 70px 80px',
      padding: '12px 16px', borderBottom: '1px solid var(--border)',
      gap: '8px', alignItems: 'center',
    }}>
      {[20, 140, 60, 60, 30, 64].map((w, i) => (
        <div key={i} style={{
          height: '12px', width: w, background: 'var(--bg-3)',
          borderRadius: '2px', animation: 'skeleton 1.5s ease infinite',
          animationDelay: `${i * 0.1}s`, marginLeft: i > 1 ? 'auto' : 0,
        }} />
      ))}
    </div>
  )

  const change = col.floor_change_24h_pct
  const isUp = change > 0

  return (
    <Link href={`/collection/${col.address}`}>
      <div style={{
        display: 'grid', gridTemplateColumns: '36px 1fr 110px 110px 70px 80px',
        padding: '10px 16px', borderBottom: '1px solid var(--border)',
        alignItems: 'center', transition: 'background 0.15s', cursor: 'crosshair',
      }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px',
          color: rank <= 3 ? 'var(--amber)' : 'var(--text-3)',
          fontWeight: rank <= 3 ? 700 : 400,
        }}>{rank}</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '4px', flexShrink: 0,
            background: 'var(--bg-3)', overflow: 'hidden',
            border: '1px solid var(--border)',
          }}>
            {col.image_url && <img src={col.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: '13px', fontWeight: 600, color: 'var(--text-0)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              {col.name}
              {col.is_verified && <span style={{ color: 'var(--cyan)', fontSize: '9px' }}>✦</span>}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-2)' }}>
              {fmt(col.unique_holders, 0)} holders
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600 }}>
            {fmtEth(col.floor_price_eth)}
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            color: change == null ? 'var(--text-2)' : isUp ? 'var(--green)' : 'var(--red)',
          }}>
            {fmtPct(change)}
          </div>
        </div>

        <div style={{
          textAlign: 'right', fontFamily: 'var(--font-mono)',
          fontSize: '12px', fontWeight: 600, color: 'var(--text-0)',
        }}>
          {fmtEth(col.volume_24h_eth)}
        </div>

        <div style={{
          textAlign: 'right', fontFamily: 'var(--font-mono)',
          fontSize: '12px', color: 'var(--text-1)',
        }}>
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
  const { data } = useSWR(apiUrl('/sales/live?limit=20'), fetcher, { refreshInterval: 8000 })
  const sales = (data as any[]) || []

  return (
    <div style={{
      background: 'var(--bg-1)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 16px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-0)',
        fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 600,
        color: 'var(--text-3)', letterSpacing: '0.15em',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--green)', animation: 'pulse-dot 2s infinite' }} />
        TRANSACTION STREAM
      </div>

      <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
        {sales.length === 0 ? (
          <div style={{
            padding: '48px 24px', textAlign: 'center',
            fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-3)',
          }}>
            <div style={{ marginBottom: '8px', fontSize: '20px' }}>◌</div>
            AWAITING TRANSACTIONS…
          </div>
        ) : sales.map((sale: any, i: number) => (
          <div key={sale.id} style={{
            padding: '12px 16px', borderBottom: '1px solid var(--border)',
            transition: 'background 0.15s',
            animation: `slide-in-left 0.3s ease ${i * 0.02}s both`,
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-0)' }}>
                {sale.collection?.name || '—'}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700,
                color: sale.is_whale_sale ? 'var(--amber)' : 'var(--green)',
                textShadow: sale.is_whale_sale ? '0 0 12px var(--amber-glow)' : 'none',
              }}>
                {fmtEth(sale.price_eth)}
                {sale.is_whale_sale && ' ◆'}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-2)' }}>
                #{sale.token_id} · {shortAddr(sale.buyer)}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)' }}>
                {timeAgo(sale.block_timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
