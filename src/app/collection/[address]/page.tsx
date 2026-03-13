'use client'
import useSWR from 'swr'
import Link from 'next/link'
import { apiUrl, fetcher, fmtEth, fmtUsd, fmtPct, fmt, shortAddr, timeAgo } from '@/lib/api'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

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
  const isVerified = c?.is_verified

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
          border: isVerified ? '2px solid var(--green)' : '2px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', color: 'var(--text-2)',
          boxShadow: isVerified ? '0 0 20px rgba(0,255,133,0.2)' : 'none',
        }}>
          {c?.image_url ? <img src={c.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : c?.symbol?.[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1px' }}>{c?.name || '—'}</h1>
            {isVerified && <VerifiedBadge />}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-2)' }}>{address}</div>
        </div>
        {!isVerified && (
          <Link
            href="/submit"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', background: 'transparent',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-2)',
              letterSpacing: '0.1em', textDecoration: 'none',
              transition: 'border-color 0.2s, color 0.2s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)' }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth="1"/>
              <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            GET VERIFIED
          </Link>
        )}
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
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px' }}>Floor Price · 7D</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={floorData}>
              <defs>
                <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--green)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--green)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" tick={{ fill: '#5a7090', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5a7090', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} width={50} tickFormatter={v => v.toFixed(3)} />
              <Tooltip contentStyle={{ background: '#0d1520', border: '1px solid #162234', borderRadius: '8px', color: '#f0f4ff', fontFamily: 'Space Mono', fontSize: 12 }} formatter={(v: any) => [v.toFixed(4) + ' ETH', 'Floor']} />
              <Area type="monotone" dataKey="v" stroke="var(--green)" strokeWidth={2} fill="url(#floorGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px' }}>Volume · 7D</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={volData}>
              <XAxis dataKey="t" tick={{ fill: '#5a7090', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5a7090', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} width={50} tickFormatter={v => v.toFixed(1)} />
              <Tooltip contentStyle={{ background: '#0d1520', border: '1px solid #162234', borderRadius: '8px', color: '#f0f4ff', fontFamily: 'Space Mono', fontSize: 12 }} formatter={(v: any) => [v.toFixed(3) + ' ETH', 'Volume']} />
              <Bar dataKey="v" fill="var(--green)" fillOpacity={0.7} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Standard: Holder Distribution & Recent Sales */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px' }}>Holder Distribution</h3>
          {h?.buckets ? h.buckets.map((b: any) => (
            <div key={b.label} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-1)' }}>{b.label} token{b.label !== '1' ? 's' : ''}</span>
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-0)' }}>{b.count} ({b.pct?.toFixed(1)}%)</span>
              </div>
              <div style={{ height: '4px', background: 'var(--bg-3)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${b.pct}%`, background: 'var(--green)', borderRadius: '2px', transition: 'width 0.5s ease' }} />
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
                  <div style={{ fontSize: '11px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{shortAddr(sale.buyer)}</div>
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

      {/* ── PREMIUM ANALYTICS (verified only) ── */}
      {isVerified ? (
        <PremiumAnalytics address={address} h={h} s={s} />
      ) : (
        <PremiumLocked />
      )}
    </div>
  )
}

// ── Verified Badge ────────────────────────────────────────────────────────────
function VerifiedBadge() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: 'rgba(0,255,133,0.1)', border: '1px solid rgba(0,255,133,0.3)', borderRadius: '20px' }}>
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7.5" fill="rgba(0,255,133,0.2)" stroke="var(--green)" strokeWidth="1.2"/>
        <path d="M5 8l2 2 4-4" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600, color: 'var(--green)', letterSpacing: '0.1em' }}>VERIFIED</span>
    </div>
  )
}

// ── Premium Locked Banner ─────────────────────────────────────────────────────
function PremiumLocked() {
  return (
    <div style={{ position: 'relative', background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '48px 32px', textAlign: 'center', overflow: 'hidden' }}>
      {/* Background pattern */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.3 }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(0,255,133,0.08)', border: '1px solid rgba(0,255,133,0.2)', borderRadius: '20px', marginBottom: '20px' }}>
          <span style={{ fontSize: '14px' }}>🔒</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green)', letterSpacing: '0.1em' }}>PREMIUM ANALYTICS</span>
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 900, color: 'var(--text-0)', letterSpacing: '-0.5px', marginBottom: '12px' }}>
          VERIFIED COLLECTIONS ONLY
        </h3>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto 24px' }}>
          Get your collection verified to unlock holder distribution analysis, wash trading detection, full price history charts, and whale tracker.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {['◈ Holder Distribution', '⚠ Wash Trading Detection', '▲ Price History Chart', '🐋 Whale Tracker'].map(label => (
            <span key={label} style={{ padding: '6px 12px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-2)' }}>
              {label}
            </span>
          ))}
        </div>
        <Link href="/submit" style={{
          display: 'inline-block', padding: '12px 32px',
          background: 'var(--green)', borderRadius: 'var(--radius-sm)',
          fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800,
          color: '#000', letterSpacing: '0.05em', textDecoration: 'none',
          transition: 'opacity 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          APPLY FOR VERIFICATION →
        </Link>
      </div>
    </div>
  )
}

// ── Premium Analytics Section ─────────────────────────────────────────────────
function PremiumAnalytics({ address, h, s }: { address: string; h: any; s: any[] }) {
  const { data: whales } = useSWR(apiUrl(`/collection/${address}/whales?limit=10`), fetcher, { refreshInterval: 120000 })
  const { data: washData } = useSWR(apiUrl(`/collection/${address}/wash-trading`), fetcher, { refreshInterval: 300000 })
  const w = (whales as any[]) || []
  const wash = washData as any

  // Pie chart data for holder concentration
  const pieData = h?.buckets ? h.buckets.slice(0, 5).map((b: any) => ({ name: b.label, value: b.pct })) : []
  const PIE_COLORS = ['#00FF85', '#00CC6A', '#009950', '#006635', '#003320']

  // Wash trading score color
  const washScore = wash?.wash_score ?? 0
  const washColor = washScore > 60 ? '#ff4d4d' : washScore > 30 ? '#ffaa00' : '#00FF85'

  return (
    <div>
      {/* Premium header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
        <VerifiedBadge />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '0.05em' }}>PREMIUM ANALYTICS</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

        {/* Holder Concentration Pie */}
        <div style={{ background: 'var(--bg-1)', border: '1px solid rgba(0,255,133,0.2)', borderRadius: 'var(--radius)', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--green)', letterSpacing: '0.1em' }}>◈ HOLDER DISTRIBUTION</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                  {pieData.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {pieData.map((entry: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-1)', flex: 1 }}>{entry.name} NFT{entry.name !== '1' ? 's' : ''}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-0)', fontWeight: 700 }}>{entry.value?.toFixed(1)}%</span>
                </div>
              ))}
              {h && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-2)' }}>
                    Top 10 wallets hold <span style={{ color: 'var(--green)', fontWeight: 700 }}>{h.top10_pct?.toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Wash Trading Detection */}
        <div style={{ background: 'var(--bg-1)', border: '1px solid rgba(0,255,133,0.2)', borderRadius: 'var(--radius)', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--green)', letterSpacing: '0.1em' }}>⚠ WASH TRADING DETECTION</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
            {/* Score circle */}
            <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="var(--bg-3)" strokeWidth="8" />
                <circle cx="40" cy="40" r="34" fill="none" stroke={washColor} strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 34 * washScore / 100} ${2 * Math.PI * 34}`}
                  strokeLinecap="round" transform="rotate(-90 40 40)" style={{ transition: 'stroke-dasharray 1s ease' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 900, color: washColor }}>{washScore}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-3)' }}>RISK</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: washColor, marginBottom: '6px' }}>
                {washScore > 60 ? 'HIGH RISK' : washScore > 30 ? 'MODERATE' : 'LOW RISK'}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-2)', lineHeight: 1.6 }}>
                {wash?.flagged_sales ?? 0} suspicious transactions detected out of {wash?.total_sales ?? 0} total sales.
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {[
              { label: 'BACK TRADES', value: wash?.back_trades ?? 0 },
              { label: 'RAPID SALES', value: wash?.rapid_resales ?? 0 },
              { label: 'LOOP TRADES', value: wash?.loop_trades ?? 0 },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: value > 0 ? '#ffaa00' : 'var(--text-0)' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Whale Tracker */}
      <div style={{ background: 'var(--bg-1)', border: '1px solid rgba(0,255,133,0.2)', borderRadius: 'var(--radius)', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--green)', letterSpacing: '0.1em' }}>🐋 WHALE TRACKER</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-3)' }}>TOP HOLDERS & RECENT ACTIVITY</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['RANK', 'WALLET', 'HOLDINGS', '% SUPPLY', 'LAST ACTIVE', 'TYPE'].map(h => (
                  <th key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-3)', letterSpacing: '0.1em', padding: '0 12px 12px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {w.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '24px 12px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-2)' }}>No whale data yet</td></tr>
              ) : w.map((whale: any, i: number) => (
                <tr key={whale.wallet_address} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 900, color: i < 3 ? 'var(--green)' : 'var(--text-2)' }}>#{i + 1}</td>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-0)' }}>
                    <a href={`/wallet/${whale.wallet_address}`} style={{ color: 'var(--green)', textDecoration: 'none' }}>{shortAddr(whale.wallet_address)}</a>
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--text-0)' }}>{whale.token_count}</td>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-1)' }}>{whale.supply_pct?.toFixed(2)}%</td>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-2)' }}>{whale.last_active ? timeAgo(whale.last_active) : '—'}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '2px 8px', background: whale.is_whale ? 'rgba(0,255,133,0.1)' : 'var(--bg-2)', border: `1px solid ${whale.is_whale ? 'rgba(0,255,133,0.3)' : 'var(--border)'}`, borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '9px', color: whale.is_whale ? 'var(--green)' : 'var(--text-2)' }}>
                      {whale.is_whale ? '🐋 WHALE' : 'HOLDER'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}