'use client'
import useSWR from 'swr'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { apiUrl, fetcher, fmtEth, fmtUsd, fmtPct, fmt, timeAgo, shortAddr } from '@/lib/api'

export default function CollectionPage() {
  const { address } = useParams<{ address: string }>()

  const { data: colData, isLoading } = useSWR(
    address ? apiUrl(`/collection/${address}`) : null,
    fetcher, { refreshInterval: 30000 }
  )
  const { data: salesData } = useSWR(
    address ? apiUrl(`/collection/${address}/sales?limit=20`) : null,
    fetcher, { refreshInterval: 15000 }
  )
  const { data: holdersData } = useSWR(
    address ? apiUrl(`/collection/${address}/holders?limit=10`) : null,
    fetcher
  )

  const col = (colData as any)?.data ?? (colData as any)
  const sales = (salesData as any)?.data ?? (salesData as any[]) ?? []
  const holders = (holdersData as any)?.data ?? (holdersData as any) ?? {}

  if (isLoading) return <LoadingState />
  if (!col && !isLoading) return <NotFound address={address} />

  const stats = [
    { label: 'FLOOR', value: fmtEth(col?.floor_price_eth), sub: fmtUsd(col?.floor_price_usd), accent: true },
    { label: 'VOL 24H', value: fmtEth(col?.volume_24h_eth), sub: fmtUsd(col?.volume_24h_usd) },
    { label: 'VOL 7D', value: fmtEth(col?.volume_7d_eth), sub: '' },
    { label: 'VOL TOTAL', value: fmtEth(col?.volume_total_eth), sub: '' },
    { label: 'SALES 24H', value: fmt(col?.sales_24h, 0), sub: 'transactions' },
    { label: 'HOLDERS', value: fmt(col?.unique_holders, 0), sub: 'unique wallets' },
    { label: 'MKT CAP', value: fmtEth(col?.market_cap_eth), sub: fmtUsd(col?.market_cap_usd) },
    { label: 'SUPPLY', value: fmt(col?.total_supply, 0), sub: col?.token_standard },
  ]

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px 60px' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)' }}>
        <Link href="/collections" style={{ color: 'var(--text-2)', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--cyan)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}
        >COLLECTIONS</Link>
        <span>›</span>
        <span style={{ color: 'var(--text-1)' }}>{col?.name?.toUpperCase() || address?.slice(0, 8)}</span>
      </div>

      {/* Collection header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '36px' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '12px', flexShrink: 0,
          background: 'var(--bg-3)', overflow: 'hidden',
          border: '1px solid var(--border-bright)',
          boxShadow: '0 0 20px rgba(0,255,133,0.1)',
        }}>
          {col?.image_url && <img src={col.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 900, color: 'var(--text-0)', letterSpacing: '-0.5px' }}>
              {col?.name || '—'}
            </h1>
            {col?.is_verified && (
              <span style={{ color: 'var(--cyan)', fontSize: '14px', textShadow: '0 0 8px var(--cyan-glow)' }}>✦</span>
            )}
            {col?.symbol && (
              <span className="tag tag-cyan">{col.symbol}</span>
            )}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-2)', marginBottom: '8px' }}>
            {address}
          </div>
          {col?.description && (
            <p style={{ fontSize: '13px', color: 'var(--text-1)', maxWidth: '600px', lineHeight: 1.6 }}>
              {col.description}
            </p>
          )}
        </div>

        {/* Floor change badge */}
        {col?.floor_change_24h_pct != null && (
          <div style={{
            padding: '12px 20px', borderRadius: 'var(--radius-md)',
            background: col.floor_change_24h_pct >= 0 ? 'rgba(0,255,133,0.08)' : 'rgba(255,61,90,0.08)',
            border: `1px solid ${col.floor_change_24h_pct >= 0 ? 'rgba(0,255,133,0.2)' : 'rgba(255,61,90,0.2)'}`,
            textAlign: 'center', flexShrink: 0,
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-3)', letterSpacing: '0.15em', marginBottom: '4px' }}>FLOOR 24H</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: col.floor_change_24h_pct >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {fmtPct(col.floor_change_24h_pct)}
            </div>
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)',
        gap: '1px', marginBottom: '40px',
        background: 'var(--border)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', overflow: 'hidden',
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: 'var(--bg-1)', padding: '20px 16px', position: 'relative' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.15em', marginBottom: '10px' }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: s.accent ? 'var(--cyan)' : 'var(--text-0)', letterSpacing: '-0.3px', lineHeight: 1, marginBottom: '4px', textShadow: s.accent ? '0 0 16px var(--cyan-glow)' : 'none' }}>
              {isLoading ? '···' : (s.value || '—')}
            </div>
            {s.sub && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-2)' }}>{s.sub}</div>}
            {i < 7 && <div style={{ position: 'absolute', right: 0, top: '20%', bottom: '20%', width: '1px', background: 'var(--border)' }} />}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>

        {/* Sales history */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--text-0)' }}>RECENT SALES</h2>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-2)' }}>last transactions</span>
            </div>
          </div>

          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px 120px 120px', padding: '10px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.15em', background: 'var(--bg-0)' }}>
              <span>TOKEN</span><span>DETAILS</span><span style={{ textAlign: 'right' }}>PRICE</span><span style={{ textAlign: 'right' }}>BUYER</span><span style={{ textAlign: 'right' }}>TIME</span>
            </div>
            {sales.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-3)' }}>
                <div style={{ color: 'var(--cyan)', marginBottom: '8px' }}>◌</div>NO SALES YET
              </div>
            ) : sales.map((sale: any, i: number) => (
              <div key={sale.id ?? i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px 120px 120px', padding: '11px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center', transition: 'all 0.15s', borderLeft: '2px solid transparent' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,133,0.03)'; e.currentTarget.style.borderLeftColor = 'var(--border-bright)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeftColor = 'transparent' }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-1)', fontWeight: 600 }}>#{sale.token_id}</div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{sale.sale_type || 'secondary'}</div>
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: sale.is_whale_sale ? 'var(--amber)' : 'var(--cyan)' }}>
                  {fmtEth(sale.price_eth)}
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-1)' }}>
                  {shortAddr(sale.buyer_address || sale.buyer)}
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)' }}>
                  {timeAgo(sale.block_timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top holders */}
        <div>
          <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--text-0)' }}>TOP HOLDERS</h2>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-2)' }}>by tokens held</span>
          </div>

          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            {(!holders.holders || holders.holders.length === 0) ? (
              <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-3)' }}>
                <div style={{ color: 'var(--cyan)', marginBottom: '8px' }}>◌</div>NO DATA YET
              </div>
            ) : (holders.holders || []).slice(0, 10).map((h: any, i: number) => (
              <div key={h.address ?? i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,255,133,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: i < 3 ? 'var(--amber)' : 'var(--text-3)', fontWeight: i < 3 ? 700 : 400, width: '20px', flexShrink: 0 }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-0)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {shortAddr(h.address)}
                  </div>
                  {h.pct_supply != null && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-3)', marginTop: '2px' }}>
                      {parseFloat(h.pct_supply).toFixed(1)}% supply
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--cyan)' }}>
                    {fmt(h.tokens_held, 0)}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-3)' }}>tokens</div>
                </div>
              </div>
            ))}
          </div>

          {/* Distribution summary */}
          {holders.distribution && (
            <div style={{ marginTop: '16px', background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-3)', letterSpacing: '0.15em', marginBottom: '12px' }}>DISTRIBUTION</div>
              {[
                { label: 'TOP 1%', value: holders.distribution.top1_pct },
                { label: 'TOP 5%', value: holders.distribution.top5_pct },
                { label: 'TOP 10%', value: holders.distribution.top10_pct },
              ].map(d => (
                <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-2)', width: '40px' }}>{d.label}</span>
                  <div style={{ flex: 1, height: '4px', background: 'var(--bg-4)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(d.value ?? 0, 100)}%`, height: '100%', background: 'var(--cyan)', borderRadius: '2px', transition: 'width 0.8s ease' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-1)', width: '35px', textAlign: 'right' }}>
                    {d.value != null ? `${parseFloat(d.value).toFixed(1)}%` : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', gap: '24px', marginBottom: '36px', alignItems: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'var(--bg-3)', animation: 'skeleton 1.5s ease infinite' }} />
        <div>
          <div style={{ width: '200px', height: '32px', background: 'var(--bg-3)', borderRadius: '4px', animation: 'skeleton 1.5s ease infinite', marginBottom: '8px' }} />
          <div style={{ width: '320px', height: '14px', background: 'var(--bg-3)', borderRadius: '4px', animation: 'skeleton 1.5s ease infinite' }} />
        </div>
      </div>
    </div>
  )
}

function NotFound({ address }: { address: string }) {
  return (
    <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '48px', color: 'var(--border-bright)', marginBottom: '24px' }}>◌</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--text-0)', marginBottom: '12px' }}>COLLECTION NOT FOUND</h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-2)', marginBottom: '24px', wordBreak: 'break-all' }}>{address}</p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-3)', marginBottom: '32px' }}>This collection may not be tracked yet or the indexer is still syncing.</p>
      <Link href="/collections" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--cyan)', letterSpacing: '0.1em', border: '1px solid var(--border-bright)', padding: '10px 20px', borderRadius: 'var(--radius)' }}>
        ← BACK TO COLLECTIONS
      </Link>
    </div>
  )
}
