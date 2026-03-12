'use client'
import useSWR from 'swr'
import { apiUrl, fetcher, fmtEth, fmtUsd, fmtPct, fmt, shortAddr, timeAgo } from '@/lib/api'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function CollectionPage({ params }: { params: { address: string } }) {
  const { address } = params
  const { data: col } = useSWR(apiUrl(`/collection/${address}`), fetcher, { refreshInterval: 60000 })
  const { data: charts } = useSWR(apiUrl(`/collection/${address}/charts?period=7d`), fetcher, { refreshInterval: 120000 })
  const { data: sales } = useSWR(apiUrl(`/collection/${address}/sales?limit=20`), fetcher, { refreshInterval: 30000 })
  const { data: holders } = useSWR(apiUrl(`/collection/${address}/distribution`), fetcher, { refreshInterval: 300000 })

  const c = col as any
  const ch = charts as any
  const s = (sales as any[]) || []
  const h = holders as any

  const floorData = ch?.floor_history?.map((p: any) => ({
    t: new Date(p.t).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    v: p.v, v_usd: p.v_usd,
  })) || []

  const volData = ch?.volume_history?.map((p: any) => ({
    t: new Date(p.t).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    v: p.v, sales: p.sales,
  })) || []

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '40px', alignItems: 'flex-start' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '16px',
          background: 'var(--bg-3)', overflow: 'hidden', flexShrink: 0,
          border: '2px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', color: 'var(--text-2)',
        }}>
          {c?.image_url ? <img src={c.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : c?.symbol?.[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1px' }}>{c?.name || '—'}</h1>
            {c?.is_verified && <span style={{ padding: '2px 8px', background: 'var(--accent-dim)', color: 'var(--accent)', borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>VERIFIED</span>}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-2)' }}>{address}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '32px' }}>
        {[
          { label: 'Floor Price', value: fmtEth(c?.floor_price_eth), sub: fmtUsd(c?.floor_price_usd), change: c?.floor_price_change_24h },
          { label: 'Vol 24H', value: fmtEth(c?.volume_24h_eth), sub: fmtUsd(c?.volume_24h_usd) },
          { label: 'Vol 7D', value: fmtEth(c?.volume_7d_eth), sub: '' },
          { label: 'Sales 24H', value: fmt(c?.sales_24h, 0), sub: 'transactions' },
          { label: 'Holders', value: fmt(c?.unique_holders, 0), sub: fmtPct(c?.holder_change_24h) + ' 24h' },
          { label: 'Market Cap', value: fmtEth(c?.market_cap_eth), sub: fmtUsd(c?.market_cap_usd) },
          { label: 'Whales', value: fmt(c?.whale_wallet_count, 0), sub: 'wallets' },
          { label: 'Listed', value: c?.listed_percentage ? c.listed_percentage.toFixed(1) + '%' : '—', sub: fmt(c?.listed_count, 0) + ' items' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'var(--bg-1)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '16px 20px',
          }}>
            <div style={{ fontSize: '10px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{stat.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '4px' }}>{stat.value || '—'}</div>
            <div style={{ fontSize: '11px', color: stat.change != null ? (stat.change > 0 ? 'var(--green)' : 'var(--red)') : 'var(--text-2)' }}>
              {stat.change != null ? fmtPct(stat.change) : stat.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
        {/* Floor chart */}
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px' }}>Floor Price · 7D</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={floorData}>
              <defs>
                <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" tick={{ fill: '#5a7090', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5a7090', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} width={50} tickFormatter={v => v.toFixed(3)} />
              <Tooltip contentStyle={{ background: '#0d1520', border: '1px solid #162234', borderRadius: '8px', color: '#f0f4ff', fontFamily: 'Space Mono', fontSize: 12 }} formatter={(v: any) => [v.toFixed(4) + ' ETH', 'Floor']} />
              <Area type="monotone" dataKey="v" stroke="#00d4ff" strokeWidth={2} fill="url(#floorGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Volume chart */}
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px' }}>Volume · 7D</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={volData}>
              <XAxis dataKey="t" tick={{ fill: '#5a7090', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5a7090', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} width={50} tickFormatter={v => v.toFixed(1)} />
              <Tooltip contentStyle={{ background: '#0d1520', border: '1px solid #162234', borderRadius: '8px', color: '#f0f4ff', fontFamily: 'Space Mono', fontSize: 12 }} formatter={(v: any) => [v.toFixed(3) + ' ETH', 'Volume']} />
              <Bar dataKey="v" fill="#00d4ff" fillOpacity={0.7} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Holder Distribution & Sales */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Holder distribution */}
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px' }}>Holder Distribution</h3>
          {h?.buckets ? h.buckets.map((b: any) => (
            <div key={b.label} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-1)' }}>{b.label} token{b.label !== '1' ? 's' : ''}</span>
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-0)' }}>{b.count} ({b.pct?.toFixed(1)}%)</span>
              </div>
              <div style={{ height: '4px', background: 'var(--bg-3)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${b.pct}%`, background: 'var(--accent)', borderRadius: '2px', transition: 'width 0.5s ease' }} />
              </div>
            </div>
          )) : <div style={{ color: 'var(--text-2)', fontSize: '13px' }}>No distribution data yet</div>}
          {h && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>TOP 10 HOLD</div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>{h.top10_pct?.toFixed(1)}%</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>WHALES</div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>{h.whale_count}</div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Sales */}
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Recent Sales</h3>
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {s.length === 0 ? (
              <div style={{ color: 'var(--text-2)', fontSize: '13px' }}>No sales data yet</div>
            ) : s.map((sale: any) => (
              <div key={sale.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: '1px solid var(--border)',
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>#{sale.token_id}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
                    {shortAddr(sale.buyer)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: sale.is_whale_sale ? 'var(--gold)' : 'var(--text-0)' }}>
                    {fmtEth(sale.price_eth)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>{timeAgo(sale.block_timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
