import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Cairo } from 'next/font/google'

const font = Cairo({ subsets: ['arabic', 'latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Egytronic POS',
  description: 'Bilingual Arabic/English cloud point of sale',
}
export const viewport: Viewport = { themeColor: '#0f766e', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ar' dir='rtl'>
      <body className={font.className}>{children}</body>
    </html>
  )
}
