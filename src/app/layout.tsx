import type { Metadata } from 'next'
import './globals.css'
import { Navigation } from '@/components/layout/Navigation'
import { Providers } from '@/components/layout/PrivyProvider'

export const metadata: Metadata = {
  title: 'ABSTRACK — Abstract Chain NFT Analytics',
  description: 'Real-time NFT analytics on Abstract Chain. Track collections, tokens, sales and market data.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="grid-bg" />
        <div className="scanline" />
        <div className="radial-glow" />
        <Providers>
          <Navigation />
          <main style={{ paddingTop: '80px', position: 'relative', zIndex: 2 }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
