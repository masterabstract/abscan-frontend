'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { apiUrl, fetcher } from '@/lib/api'
import useSWR from 'swr'
import { usePrivy, useCrossAppAccounts } from '@privy-io/react-auth'

const NAV_LINKS = [
  { href: '/', label: 'DASHBOARD' },
  { href: '/collections', label: 'COLLECTIONS' },
  { href: '/tokens', label: 'TOKENS' },
  { href: '/sales', label: 'LIVE SALES' },
]

export function Navigation() {
  const pathname = usePathname()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [scrolled, setScrolled] = useState(false)
  const [time, setTime] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const tick = () => setTime(new Date().toUTCString().slice(17, 25) + ' UTC')
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (search.length < 2) { setResults([]); return }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(apiUrl(`/collections/search?q=${encodeURIComponent(search)}&limit=6`))
        const json = await res.json()
        setResults(Array.isArray(json.data) ? json.data : [])
      } catch { setResults([]) }
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  return (
    <>
      {/* Top ticker bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 101,
        height: '28px',
        background: 'var(--bg-0)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        padding: '0 24px',
        gap: '24px',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-2)', letterSpacing: '0.1em' }}>
          ABSTRACK
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)' }}>│</span>
        <EthTicker />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)' }}>│</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-2)' }}>
          ABSTRACT CHAIN · #2741
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: 'var(--green)',
            animation: 'pulse-dot 2s ease infinite',
          }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--green)' }}>
            LIVE
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', marginLeft: '12px' }}>
            {time}
          </span>
        </div>
      </div>

      {/* Main nav */}
      <nav style={{
        position: 'fixed', top: '28px', left: 0, right: 0, zIndex: 100,
        height: '52px',
        background: scrolled ? 'rgba(2,4,7,0.97)' : 'rgba(2,4,7,0.9)',
        backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${scrolled ? 'var(--border-mid)' : 'var(--border)'}`,
        transition: 'all 0.3s ease',
        display: 'flex', alignItems: 'center',
        padding: '0 24px', gap: '0',
      }}>
        {/* Logo */}
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          flexShrink: 0, marginRight: '32px',
          padding: '4px 0',
        }}>
          <div style={{
            width: '28px', height: '28px',
            border: '1px solid var(--cyan)',
            borderRadius: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 0 12px var(--cyan-glow), inset 0 0 8px rgba(0,255,133,0.1)',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700,
              color: 'var(--cyan)', letterSpacing: '-0.05em',
            }}>AT</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0' }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 900,
              color: 'var(--cyan)', letterSpacing: '0.02em',
              textShadow: '0 0 20px var(--cyan-glow)',
            }}>ABS</span>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 900,
              color: 'var(--text-0)', letterSpacing: '0.02em',
            }}>TRACK</span>
          </div>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', height: '100%' }}>
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center',
                padding: '0 16px', height: '100%',
                fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500,
                letterSpacing: '0.1em',
                color: active ? 'var(--cyan)' : 'var(--text-2)',
                borderBottom: active ? '2px solid var(--cyan)' : '2px solid transparent',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text-1)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-2)' }}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: '320px', marginLeft: '24px', position: 'relative' }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            background: 'var(--bg-2)', border: '1px solid var(--border-mid)',
            borderRadius: 'var(--radius)', overflow: 'hidden',
            transition: 'border-color 0.2s',
          }}>
            <span style={{
              padding: '0 10px', fontFamily: 'var(--font-mono)',
              fontSize: '10px', color: 'var(--text-3)', letterSpacing: '0.1em',
              flexShrink: 0,
            }}>SRC/</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="collections…"
              style={{
                flex: 1, padding: '8px 12px 8px 0',
                background: 'transparent', border: 'none',
                color: 'var(--text-0)', fontSize: '12px',
                fontFamily: 'var(--font-mono)', outline: 'none',
                caretColor: 'var(--cyan)',
              }}
              onFocus={e => (e.currentTarget.parentElement!.style.borderColor = 'var(--border-glow)')}
              onBlur={e => {
                e.currentTarget.parentElement!.style.borderColor = 'var(--border-mid)'
                setTimeout(() => setResults([]), 200)
              }}
            />
          </div>

          {results.length > 0 && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
              background: 'var(--bg-2)', border: '1px solid var(--border-bright)',
              borderRadius: 'var(--radius-md)', overflow: 'hidden', zIndex: 200,
              boxShadow: '0 24px 48px rgba(0,0,0,0.8), 0 0 0 1px var(--border)',
            }}>
              {results.map((r: any) => (
                <Link key={r.id} href={`/collection/${r.address}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px', borderBottom: '1px solid var(--border)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-3)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '4px',
                    background: 'var(--bg-4)', flexShrink: 0, overflow: 'hidden',
                    border: '1px solid var(--border)',
                  }}>
                    {r.image_url && <img src={r.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-0)' }}>{r.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
                      {r.address?.slice(0, 8)}…
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Wallet button */}
        <div style={{ marginLeft: '16px', flexShrink: 0 }}>
          <WalletButton />
        </div>
      </nav>
    </>
  )
}

// Abstract Provider App ID (from Privy dashboard > Global Wallet > Integrations)
const ABSTRACT_PRIVY_APP_ID = 'cm04asygd041fmry9zmcyn5o5'

function WalletButton() {
  const { ready, authenticated, logout, user } = usePrivy()
  const { loginWithCrossAppAccount } = useCrossAppAccounts()
  const [open, setOpen] = useState(false)

  // Get AGW address from linked cross-app account
  const crossAppAccount = user?.linkedAccounts?.find((a: any) => a.type === 'cross_app')
  const agwAddress = (crossAppAccount as any)?.embeddedWallets?.[0]?.address

  if (!ready) return (
    <div style={{
      padding: '7px 16px', borderRadius: 'var(--radius)',
      background: 'var(--bg-2)', border: '1px solid var(--border)',
      fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-3)',
    }}>···</div>
  )

  if (!authenticated || !agwAddress) return (
    <button
      onClick={() => loginWithCrossAppAccount({ appId: ABSTRACT_PRIVY_APP_ID })}
      disabled={!ready}
      style={{
        padding: '7px 16px', borderRadius: 'var(--radius)',
        background: 'transparent',
        border: '1px solid var(--cyan)',
        fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600,
        color: 'var(--cyan)', letterSpacing: '0.08em', cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 0 8px var(--cyan-glow)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(0,255,133,0.1)'
        e.currentTarget.style.boxShadow = '0 0 16px var(--cyan-glow)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.boxShadow = '0 0 8px var(--cyan-glow)'
      }}
    >
      CONNECT AGW
    </button>
  )

  const short = agwAddress.slice(0, 6) + '…' + agwAddress.slice(-4)

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '6px 12px', borderRadius: 'var(--radius)',
        background: 'rgba(0,255,133,0.08)',
        border: '1px solid var(--border-bright)',
        fontFamily: 'var(--font-mono)', fontSize: '11px', cursor: 'pointer',
        transition: 'all 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
      >
        <div style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: 'var(--green)', boxShadow: '0 0 6px var(--green)',
        }} />
        <span style={{ color: 'var(--text-0)', fontWeight: 600 }}>{short}</span>
        <span style={{ color: 'var(--cyan)', fontSize: '10px' }}>AGW</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: 'var(--bg-2)', border: '1px solid var(--border-bright)',
          borderRadius: 'var(--radius-md)', minWidth: '220px', zIndex: 300,
          boxShadow: '0 24px 48px rgba(0,0,0,0.8)', overflow: 'hidden',
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: '10px', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', marginBottom: '6px', letterSpacing: '0.1em' }}>
              ABSTRACT GLOBAL WALLET
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-0)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
              {agwAddress}
            </div>
          </div>
          <button onClick={() => { logout(); setOpen(false) }} style={{
            width: '100%', padding: '12px 16px', textAlign: 'left',
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.08em',
            color: '#ff4444', transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,68,68,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            DISCONNECT
          </button>
        </div>
      )}
    </div>
  )
}

function EthTicker() {
  const { data } = useSWR(apiUrl('/dashboard/home?limit=1'), fetcher, { refreshInterval: 30000 })
  const price = (data as any)?.market_stats?.eth_price_usd

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-2)' }}>ETH/USD</span>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600,
        color: 'var(--cyan)',
      }}>
        {price ? '$' + price.toLocaleString('en', { maximumFractionDigits: 0 }) : '···'}
      </span>
    </div>
  )
}
