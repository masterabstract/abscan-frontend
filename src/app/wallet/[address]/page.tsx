'use client'
import useSWR from 'swr'
import { apiUrl, fetcher, fmtEth, fmtUsd, fmtPct, fmt, shortAddr, timeAgo } from '@/lib/api'

export default function WalletPage({ params }: { params: { address: string } }) {
  const { address } = params
  const { data: wallet } = useSWR(apiUrl(`/wallet/${address}`), fetcher)
  const { data: nfts } = useSWR(apiUrl(`/wallet/${address}/nfts?limit=24`), fetcher)
  const { data: activity } = useSWR(apiUrl(`/wallet/${address}/activity?limit=20`), fetcher)

  const w = wallet as any
  const nftList = (nfts as any[]) || []
  const actList = (activity as any[]) || []

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>WALLET</div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '-0.5px', marginBottom: '4px' }}>{address}</h1>
        {w?.ens_name && <div style={{ fontSize: '16px', color: 'var(--accent)' }}>{w.ens_name}</div>}
      </div>

      {/* Portfolio Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '40px' }}>
        {[
          { label: 'Portfolio Value', value: fmtEth(w?.portfolio_eth), sub: fmtUsd(w?.portfolio_usd) },
          { label: 'Unrealized P&L', value: fmtEth(w?.unrealized_pnl_eth), sub: fmtPct(w?.unrealized_pnl_pct), isChange: true, val: w?.unrealized_pnl_eth },
          { label: 'Collections', value: fmt(w?.collection_count, 0), sub: 'held' },
          { label: 'Total Buys', value: fmt(w?.total_buys, 0), sub: fmtEth(w?.total_spent_eth) + ' spent' },
          { label: 'Total Sells', value: fmt(w?.total_sells, 0), sub: fmtEth(w?.total_received_eth) + ' received' },
          { label: 'Realized P&L', value: fmtEth(w?.realized_pnl_eth), sub: '', isChange: true, val: w?.realized_pnl_eth },
        ].map((stat, i) => (
          <div key={i} style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{stat.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '4px', color: stat.isChange && stat.val != null ? (stat.val >= 0 ? 'var(--green)' : 'var(--red)') : 'var(--text-0)' }}>
              {stat.value || '—'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
        {/* NFT Grid */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>NFT Holdings</h2>
          {nftList.length === 0 ? (
            <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '40px', textAlign: 'center', color: 'var(--text-2)' }}>
              No NFTs found
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
              {nftList.map((nft: any, i: number) => (
                <div key={i} style={{
                  background: 'var(--bg-1)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', overflow: 'hidden',
                  transition: 'transform 0.2s, border-color 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--border-bright)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                >
                  <div style={{ height: '120px', background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'var(--text-2)', overflow: 'hidden' }}>
                    {nft.collection_image ? <img src={nft.collection_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : nft.collection_name?.[0]}
                  </div>
                  <div style={{ padding: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nft.collection_name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-2)', marginBottom: '6px' }}>×{nft.token_count}</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{fmtEth(nft.estimated_value_eth)}</div>
                    <div style={{ fontSize: '11px', color: nft.unrealized_pnl_eth >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {nft.unrealized_pnl_eth >= 0 ? '+' : ''}{fmtEth(nft.unrealized_pnl_eth)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Activity</h2>
          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            {actList.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-2)', fontSize: '13px' }}>No activity found</div>
            ) : actList.map((tx: any, i: number) => (
              <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700,
                      background: tx.side === 'buy' ? 'var(--green-dim)' : tx.side === 'sell' ? 'var(--red-dim)' : 'var(--bg-3)',
                      color: tx.side === 'buy' ? 'var(--green)' : tx.side === 'sell' ? 'var(--red)' : 'var(--text-2)',
                    }}>{tx.side?.toUpperCase()}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{tx.collection_name}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>#{tx.token_id} · {timeAgo(tx.block_timestamp)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{fmtEth(tx.price_eth)}</div>
                  {tx.realized_pnl_eth != null && (
                    <div style={{ fontSize: '11px', color: tx.realized_pnl_eth >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {tx.realized_pnl_eth >= 0 ? '+' : ''}{fmtEth(tx.realized_pnl_eth)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
