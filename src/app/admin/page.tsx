'use client'
import { useState, useEffect } from 'react'
import { usePrivy, useCrossAppAccounts } from '@privy-io/react-auth'
import { apiUrl, fetcher } from '@/lib/api'
import useSWR, { mutate } from 'swr'

const ABSTRACT_PRIVY_APP_ID = 'cm04asygd041fmry9zmcyn5o5'

// ── Admin wallet whitelist — add your AGW address here ───────────────────────
const ADMIN_WALLETS: string[] = [
  '0x067f5d956cf82479321b873a6205f7114ce85d96',
  '0xc8014fc0dcb806746b7abcfcbe0928d997d9da37'
]

type Tab = 'collections' | 'submissions'

export default function AdminPage() {
  const { ready, authenticated, user, logout } = usePrivy()
  const { loginWithCrossAppAccount } = useCrossAppAccounts()
  const [authed, setAuthed] = useState(false)

  // Get any connected wallet address (AGW or embedded)
  const agwAccount = user?.linkedAccounts?.find((a: any) => 
    a.type === 'cross_app' && a.providerApp?.id === ABSTRACT_PRIVY_APP_ID
  )
  const embeddedWallet = user?.linkedAccounts?.find((a: any) => a.type === 'wallet')
  const agwAddress = ((agwAccount as any)?.address || (embeddedWallet as any)?.address)?.toLowerCase()

  useEffect(() => {
    if (authenticated) {
      if (ADMIN_WALLETS.length === 0) {
        setAuthed(true)
      } else if (agwAddress && ADMIN_WALLETS.includes(agwAddress)) {
        setAuthed(true)
      }
    }
  }, [authenticated, agwAddress, user])

  if (!ready) return <LoadingScreen />

  if (!authenticated || !authed) {
    return <LoginScreen onLogin={() => loginWithCrossAppAccount({ appId: ABSTRACT_PRIVY_APP_ID })} authenticated={authenticated} agwAddress={agwAddress} />
  }

  return <AdminDashboard agwAddress={agwAddress} onLogout={logout} />
}

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, authenticated, agwAddress }: { onLogin: () => void; authenticated: boolean; agwAddress?: string }) {
  const notAuthorized = authenticated && agwAddress && ADMIN_WALLETS.length > 0 && !ADMIN_WALLETS.includes(agwAddress)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.2 }} />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--bg-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '28px' }}>🔐</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 900, color: 'var(--text-0)', letterSpacing: '-0.5px', marginBottom: '12px' }}>ADMIN ACCESS</h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: '32px' }}>
          {notAuthorized
            ? `Wallet ${agwAddress?.slice(0, 6)}...${agwAddress?.slice(-4)} is not authorized.`
            : 'Connect your Abstract Global Wallet to access the admin dashboard.'}
        </p>
        {!notAuthorized && (
          <button
            onClick={onLogin}
            style={{ padding: '14px 32px', background: 'var(--green)', border: 'none', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800, color: '#000', cursor: 'pointer', letterSpacing: '0.05em' }}
          >
            CONNECT AGW →
          </button>
        )}
      </div>
    </div>
  )
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
function AdminDashboard({ agwAddress, onLogout }: { agwAddress: string; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('collections')

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--green)', letterSpacing: '0.2em', marginBottom: '6px' }}>ABSTRACK · ADMIN</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 900, color: 'var(--text-0)', letterSpacing: '-0.5px' }}>DASHBOARD</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-2)', padding: '6px 12px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '6px' }}>
            {agwAddress?.slice(0, 6)}...{agwAddress?.slice(-4)}
          </div>
          <button onClick={onLogout} style={{ padding: '6px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-2)', cursor: 'pointer', letterSpacing: '0.1em' }}>
            LOGOUT
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '32px', background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '4px', width: 'fit-content' }}>
        {([
          { id: 'collections', label: 'COLLECTIONS' },
          { id: 'submissions', label: 'SUBMISSIONS' },
        ] as { id: Tab; label: string }[]).map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: '8px 20px', background: tab === id ? 'var(--bg-3)' : 'transparent', border: 'none', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: tab === id ? 'var(--green)' : 'var(--text-2)', cursor: 'pointer', letterSpacing: '0.1em', transition: 'all 0.2s' }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'collections' && <CollectionsTab />}
      {tab === 'submissions' && <SubmissionsTab />}
    </div>
  )
}

// ── Collections Tab ───────────────────────────────────────────────────────────
function CollectionsTab() {
  const { data, isLoading } = useSWR(apiUrl('/admin/collections'), fetcher, { refreshInterval: 30000 })
  const collections = (data as any[]) || []
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', contract_address: '', symbol: '', token_standard: 'ERC721', deploy_block: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function addCollection() {
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch(apiUrl('/admin/collections'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, deploy_block: parseInt(form.deploy_block) || 0 }),
      })
      if (res.ok) {
        setMsg('✓ Collection added — indexer will pick it up shortly')
        setForm({ name: '', contract_address: '', symbol: '', token_standard: 'ERC721', deploy_block: '' })
        setAdding(false)
        mutate(apiUrl('/admin/collections'))
      } else {
        const e = await res.json()
        setMsg('✗ ' + (e.error || 'Error'))
      }
    } catch {
      setMsg('✗ Network error')
    } finally {
      setSaving(false)
    }
  }

  async function toggleVerified(id: string, current: boolean) {
    await fetch(apiUrl(`/admin/collections/${id}/verify`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_verified: !current }),
    })
    mutate(apiUrl('/admin/collections'))
  }

  async function deleteCollection(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    await fetch(apiUrl(`/admin/collections/${id}`), { method: 'DELETE' })
    mutate(apiUrl('/admin/collections'))
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: 'var(--text-0)' }}>
          {collections.length} COLLECTIONS
        </div>
        <button
          onClick={() => setAdding(!adding)}
          style={{ padding: '8px 20px', background: adding ? 'var(--bg-2)' : 'var(--green)', border: adding ? '1px solid var(--border)' : 'none', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: adding ? 'var(--text-1)' : '#000', cursor: 'pointer', letterSpacing: '0.1em' }}
        >
          {adding ? 'CANCEL' : '+ ADD COLLECTION'}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div style={{ background: 'var(--bg-1)', border: '1px solid rgba(0,255,133,0.2)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '24px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--green)', letterSpacing: '0.15em', marginBottom: '20px' }}>NEW COLLECTION</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <AdminField label="NAME *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Final Bosu" />
            <AdminField label="SYMBOL" value={form.symbol} onChange={v => setForm(f => ({ ...f, symbol: v }))} placeholder="BOSU" />
            <AdminField label="CONTRACT ADDRESS *" value={form.contract_address} onChange={v => setForm(f => ({ ...f, contract_address: v }))} placeholder="0x..." mono />
            <AdminField label="DEPLOY BLOCK" value={form.deploy_block} onChange={v => setForm(f => ({ ...f, deploy_block: v }))} placeholder="e.g. 18000000" />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-3)', letterSpacing: '0.15em', marginBottom: '6px' }}>TOKEN STANDARD</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['ERC721', 'ERC1155'].map(s => (
                <button key={s} onClick={() => setForm(f => ({ ...f, token_standard: s }))} style={{ padding: '6px 16px', background: form.token_standard === s ? 'rgba(0,255,133,0.1)' : 'var(--bg-2)', border: `1px solid ${form.token_standard === s ? 'var(--green)' : 'var(--border)'}`, borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: form.token_standard === s ? 'var(--green)' : 'var(--text-2)', cursor: 'pointer' }}>{s}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={addCollection}
              disabled={saving || !form.name || !form.contract_address}
              style={{ padding: '10px 24px', background: saving ? 'var(--bg-3)' : 'var(--green)', border: 'none', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: saving ? 'var(--text-2)' : '#000', cursor: saving ? 'not-allowed' : 'pointer', letterSpacing: '0.1em' }}
            >
              {saving ? 'ADDING...' : 'ADD →'}
            </button>
            {msg && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: msg.startsWith('✓') ? 'var(--green)' : '#ff4d4d' }}>{msg}</span>}
          </div>
        </div>
      )}

      {/* Collections table */}
      <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['NAME', 'CONTRACT', 'STANDARD', 'VERIFIED', 'ACTIONS'].map(h => (
                <th key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-3)', letterSpacing: '0.15em', padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-2)' }}>Loading...</td></tr>
            ) : collections.map((col: any) => (
              <tr key={col.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--text-0)' }}>{col.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)' }}>{col.symbol}</div>
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-2)' }}>
                  {col.contract_address?.slice(0, 8)}...{col.contract_address?.slice(-6)}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '2px 8px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-2)' }}>{col.token_standard}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button
                    onClick={() => toggleVerified(col.id, col.is_verified)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: col.is_verified ? 'rgba(0,255,133,0.1)' : 'var(--bg-2)', border: `1px solid ${col.is_verified ? 'rgba(0,255,133,0.3)' : 'var(--border)'}`, borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: col.is_verified ? 'var(--green)' : 'var(--text-3)', letterSpacing: '0.05em' }}>
                      {col.is_verified ? '✓ VERIFIED' : 'UNVERIFIED'}
                    </span>
                  </button>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button
                    onClick={() => deleteCollection(col.id, col.name)}
                    style={{ padding: '4px 10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-2)', cursor: 'pointer', letterSpacing: '0.05em', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff4d4d'; e.currentTarget.style.color = '#ff4d4d' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)' }}
                  >
                    DELETE
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Submissions Tab ───────────────────────────────────────────────────────────
function SubmissionsTab() {
  const { data, isLoading } = useSWR(apiUrl('/admin/submissions'), fetcher, { refreshInterval: 30000 })
  const submissions = (data as any[]) || []
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    await fetch(apiUrl(`/admin/submissions/${id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    // If approving a verification request, also set is_verified
    mutate(apiUrl('/admin/submissions'))
  }

  const filtered = submissions.filter((s: any) => filter === 'all' || s.status === filter)
  const pending = submissions.filter((s: any) => s.status === 'pending').length

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 16px', background: filter === f ? 'var(--bg-3)' : 'transparent', border: `1px solid ${filter === f ? 'var(--green)' : 'var(--border)'}`, borderRadius: '20px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: filter === f ? 'var(--green)' : 'var(--text-2)', cursor: 'pointer', letterSpacing: '0.1em', position: 'relative' }}>
            {f.toUpperCase()}
            {f === 'pending' && pending > 0 && (
              <span style={{ position: 'absolute', top: '-6px', right: '-6px', width: '16px', height: '16px', background: '#ff4d4d', borderRadius: '50%', fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pending}</span>
            )}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {isLoading ? (
          <div style={{ padding: '32px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-2)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-2)' }}>No submissions</div>
        ) : filtered.map((sub: any) => (
          <div key={sub.id} style={{ background: 'var(--bg-1)', border: `1px solid ${sub.status === 'pending' ? 'rgba(0,255,133,0.15)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: 'var(--text-0)' }}>{sub.collection_name}</span>
                  <span style={{ padding: '2px 8px', background: sub.type === 'verification' ? 'rgba(0,255,133,0.1)' : 'var(--bg-3)', border: `1px solid ${sub.type === 'verification' ? 'rgba(0,255,133,0.2)' : 'var(--border)'}`, borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '9px', color: sub.type === 'verification' ? 'var(--green)' : 'var(--text-2)', letterSpacing: '0.1em' }}>
                    {sub.type === 'verification' ? '✓ VERIFY REQUEST' : 'NEW LISTING'}
                  </span>
                  <StatusBadge status={sub.status} />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-2)', marginBottom: '4px' }}>{sub.contract_address}</div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: sub.description || sub.reason ? '12px' : '0' }}>
                  {sub.twitter && <a href={`https://x.com/${sub.twitter.replace('@', '')}`} target="_blank" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--green)', textDecoration: 'none' }}>𝕏 {sub.twitter}</a>}
                  {sub.website && <a href={sub.website} target="_blank" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-2)', textDecoration: 'none' }}>🌐 Website</a>}
                  {sub.contact_email && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-2)' }}>✉ {sub.contact_email}</span>}
                </div>
                {(sub.description || sub.reason) && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-1)', lineHeight: 1.6, padding: '10px 12px', background: 'var(--bg-2)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    {sub.description || sub.reason}
                  </div>
                )}
              </div>
              {sub.status === 'pending' && (
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => updateStatus(sub.id, 'approved')}
                    style={{ padding: '8px 20px', background: 'rgba(0,255,133,0.1)', border: '1px solid rgba(0,255,133,0.3)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green)', cursor: 'pointer', letterSpacing: '0.05em', fontWeight: 700 }}
                  >
                    APPROVE
                  </button>
                  <button
                    onClick={() => updateStatus(sub.id, 'rejected')}
                    style={{ padding: '8px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-2)', cursor: 'pointer', letterSpacing: '0.05em' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff4d4d'; e.currentTarget.style.color = '#ff4d4d' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)' }}
                  >
                    REJECT
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    pending: { bg: 'rgba(255,170,0,0.1)', color: '#ffaa00' },
    approved: { bg: 'rgba(0,255,133,0.1)', color: 'var(--green)' },
    rejected: { bg: 'rgba(255,77,77,0.1)', color: '#ff4d4d' },
  }
  const c = colors[status] || colors.pending
  return (
    <span style={{ padding: '2px 8px', background: c.bg, border: `1px solid ${c.color}40`, borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '9px', color: c.color, letterSpacing: '0.1em' }}>
      {status.toUpperCase()}
    </span>
  )
}

function AdminField({ label, value, onChange, placeholder, mono }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-3)', letterSpacing: '0.15em', marginBottom: '6px' }}>{label}</div>
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 12px', fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)', fontSize: '12px', color: 'var(--text-0)', outline: 'none', boxSizing: 'border-box' }}
        onFocus={e => (e.currentTarget.style.borderColor = 'var(--green)')}
        onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
      />
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-2)', letterSpacing: '0.1em' }}>LOADING...</div>
    </div>
  )
}