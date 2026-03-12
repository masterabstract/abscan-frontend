import type { Metadata } from 'next'
import './globals.css'
import { Navigation } from '@/components/layout/Navigation'

export const metadata: Metadata = {
  title: 'Abscan — Abstract Chain NFT Analytics',
  description: 'Real-time NFT analytics for Abstract Chain. Track collections, sales, whales and more.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="grid-bg" />
        <div className="noise" />
        <Navigation />
        <main style={{ position: 'relative', zIndex: 2, paddingTop: '64px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
