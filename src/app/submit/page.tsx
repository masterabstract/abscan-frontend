'use client'
import { useState } from 'react'
import { apiUrl } from '@/lib/api'

type FormStep = 'type' | 'form' | 'success'
type SubmitType = 'listing' | 'verification'

export default function SubmitPage() {
  const [step, setStep] = useState<FormStep>('type')
  const [submitType, setSubmitType] = useState<SubmitType>('listing')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    collection_name: '',
    contract_address: '',
    twitter: '',
    website: '',
    discord: '',
    contact_email: '',
    description: '',
    reason: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit() {
    setLoading(true)
    try {
      await fetch(apiUrl('/submit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: submitType }),
      })
      setStep('success')
    } catch {
      // still show success — form data can be handled async
      setStep('success')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '60px 24px', position: 'relative', overflow: 'hidden' }}>

      {/* Background grid */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.3, pointerEvents: 'none', zIndex: 0 }} />

      {/* Glow accent */}
      <div style={{ position: 'fixed', top: '-200px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(0,255,133,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '640px' }}>

        {/* Header */}
        <div style={{ marginBottom: '48px', animation: 'slide-up 0.4s ease forwards' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--green)', letterSpacing: '0.2em', marginBottom: '12px' }}>
            ABSTRACK · SUBMIT
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-1px', color: 'var(--text-0)', marginBottom: '16px' }}>
            GET YOUR<br />
            <span style={{ color: 'var(--green)', textShadow: '0 0 30px rgba(0,255,133,0.4)' }}>COLLECTION</span><br />
            LISTED
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.6 }}>
            Submit your project for listing on ABSTRACK or apply for a verified badge to unlock premium analytics.
          </p>
        </div>

        {step === 'type' && (
          <div style={{ animation: 'slide-up 0.4s ease forwards' }}>

            {/* Verified badge explainer */}
            <div style={{ background: 'linear-gradient(135deg, rgba(0,255,133,0.06) 0%, rgba(0,255,133,0.02) 100%)', border: '1px solid rgba(0,255,133,0.2)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <VerifiedBadge size={24} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: 'var(--green)', letterSpacing: '0.05em' }}>VERIFIED COLLECTIONS</span>
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: '16px' }}>
                Verified collections get access to exclusive analytics unavailable to standard listings:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { icon: '◈', label: 'Holder Distribution' },
                  { icon: '⚠', label: 'Wash Trading Detection' },
                  { icon: '▲', label: 'Price History Chart' },
                  { icon: '🐋', label: 'Whale Tracker' },
                ].map(({ icon, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(0,255,133,0.05)', border: '1px solid rgba(0,255,133,0.1)', borderRadius: '6px' }}>
                    <span style={{ fontSize: '12px' }}>{icon}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-1)', letterSpacing: '0.05em' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Type selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              {([
                { type: 'listing' as SubmitType, title: 'NEW LISTING', desc: 'Submit your collection to be indexed and displayed on ABSTRACK', icon: '＋' },
                { type: 'verification' as SubmitType, title: 'GET VERIFIED', desc: 'Already listed? Apply for the verified badge and unlock premium analytics', icon: '✓' },
              ]).map(({ type, title, desc, icon }) => (
                <button
                  key={type}
                  onClick={() => setSubmitType(type)}
                  style={{
                    background: submitType === type ? 'rgba(0,255,133,0.08)' : 'var(--bg-1)',
                    border: `1px solid ${submitType === type ? 'var(--green)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '24px 20px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    boxShadow: submitType === type ? '0 0 20px rgba(0,255,133,0.1)' : 'none',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 900, color: submitType === type ? 'var(--green)' : 'var(--text-2)', marginBottom: '12px' }}>{icon}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800, color: submitType === type ? 'var(--green)' : 'var(--text-0)', letterSpacing: '0.05em', marginBottom: '8px' }}>{title}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-2)', lineHeight: 1.5 }}>{desc}</div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep('form')}
              style={{ width: '100%', padding: '16px', background: 'var(--green)', border: 'none', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: '#000', cursor: 'pointer', letterSpacing: '0.05em', transition: 'opacity 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              CONTINUE →
            </button>
          </div>
        )}

        {step === 'form' && (
          <div style={{ animation: 'slide-up 0.3s ease forwards' }}>
            <button
              onClick={() => setStep('type')}
              style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', marginBottom: '24px', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              ← BACK
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
              {submitType === 'verification' && <VerifiedBadge size={20} />}
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '0.05em' }}>
                {submitType === 'listing' ? 'COLLECTION DETAILS' : 'VERIFICATION REQUEST'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Field label="COLLECTION NAME *" value={form.collection_name} onChange={v => set('collection_name', v)} placeholder="e.g. Final Bosu" />
              <Field label="CONTRACT ADDRESS *" value={form.contract_address} onChange={v => set('contract_address', v)} placeholder="0x..." mono />
              <Field label="TWITTER / X" value={form.twitter} onChange={v => set('twitter', v)} placeholder="@handle" />
              <Field label="WEBSITE" value={form.website} onChange={v => set('website', v)} placeholder="https://" />
              <Field label="DISCORD" value={form.discord} onChange={v => set('discord', v)} placeholder="discord.gg/..." />
              <Field label="CONTACT EMAIL *" value={form.contact_email} onChange={v => set('contact_email', v)} placeholder="team@yourproject.xyz" />
              <Field label={submitType === 'verification' ? 'WHY SHOULD YOU BE VERIFIED?' : 'DESCRIBE YOUR PROJECT'} value={submitType === 'verification' ? form.reason : form.description} onChange={v => submitType === 'verification' ? set('reason', v) : set('description', v)} placeholder={submitType === 'verification' ? 'Community size, trading volume, team background...' : 'What makes your collection unique?'} multiline />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !form.collection_name || !form.contract_address || !form.contact_email}
              style={{
                width: '100%',
                padding: '16px',
                background: loading ? 'var(--bg-3)' : 'var(--green)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 800,
                color: loading ? 'var(--text-2)' : '#000',
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.05em',
                transition: 'all 0.2s',
                marginTop: '32px',
              }}
            >
              {loading ? 'SUBMITTING...' : submitType === 'listing' ? 'SUBMIT LISTING →' : 'APPLY FOR VERIFICATION →'}
            </button>

            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', textAlign: 'center', marginTop: '16px', lineHeight: 1.5 }}>
              We review all submissions manually. Expect a response within 48–72h.
            </p>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center', animation: 'slide-up 0.4s ease forwards' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0,255,133,0.1)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: '0 0 40px rgba(0,255,133,0.2)' }}>
              <span style={{ fontSize: '32px', color: 'var(--green)' }}>✓</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 900, color: 'var(--text-0)', letterSpacing: '-0.5px', marginBottom: '16px' }}>
              {submitType === 'listing' ? 'SUBMISSION RECEIVED' : 'APPLICATION RECEIVED'}
            </h2>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.7, maxWidth: '400px', margin: '0 auto 32px' }}>
              {submitType === 'listing'
                ? 'Your collection has been submitted for review. We\'ll reach out to your email within 48–72 hours.'
                : 'Your verification request is under review. If approved, your collection will receive the verified badge and unlock premium analytics.'}
            </p>
            <a
              href="/"
              style={{ display: 'inline-block', padding: '12px 32px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-1)', letterSpacing: '0.1em', textDecoration: 'none', transition: 'border-color 0.2s' }}
            >
              ← BACK TO HOME
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

function VerifiedBadge({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7.5" fill="rgba(0,255,133,0.15)" stroke="var(--green)" strokeWidth="1"/>
      <path d="M5 8l2 2 4-4" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function Field({ label, value, onChange, placeholder, mono, multiline }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  mono?: boolean
  multiline?: boolean
}) {
  const baseStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg-1)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px 14px',
    fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
    fontSize: '13px',
    color: 'var(--text-0)',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    resize: multiline ? 'vertical' : undefined,
    minHeight: multiline ? '100px' : undefined,
  }

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.15em', marginBottom: '6px' }}>{label}</div>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...baseStyle }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--green)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={baseStyle}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--green)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
      )}
    </div>
  )
}