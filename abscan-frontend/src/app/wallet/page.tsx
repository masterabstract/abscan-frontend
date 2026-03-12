'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WalletSearchPage() {
  const [address, setAddress] = useState('')
  const router = useRouter()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (address.trim()) router.push(`/wallet/${address.trim()}`)
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>👛</div>
      <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '8px' }}>Wallet Analytics</h1>
      <p style={{ color: 'var(--text-2)', marginBottom: '32px' }}>Track any wallet's NFT portfolio on Abstract Chain</p>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
        <input
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="0x... wallet address"
          style={{
            flex: 1, padding: '12px 16px', background: 'var(--bg-2)',
            border: '1px solid var(--border)', borderRadius: '12px',
            color: 'var(--text-0)', fontSize: '14px', outline: 'none',
            fontFamily: 'var(--font-mono)',
          }}
        />
        <button type="submit" style={{
          padding: '12px 24px', background: 'var(--accent)', color: '#000',
          border: 'none', borderRadius: '12px', fontWeight: 700,
          fontSize: '14px', cursor: 'pointer', flexShrink: 0,
        }}>Search</button>
      </form>
    </div>
  )
}
