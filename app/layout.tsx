import type { Metadata } from 'next'
import { Hanken_Grotesk, Spline_Sans_Mono } from 'next/font/google'
import { Providers } from '@/components/providers'
import { ConditionalBottomNav } from '@/components/ConditionalBottomNav'
import './globals.css'

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const spline = Spline_Sans_Mono({
  subsets: ['latin'],
  variable: '--font-spline',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Tally',
  description: 'Track and compare grocery prices across Canadian stores',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${hanken.variable} ${spline.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <ConditionalBottomNav />
        </Providers>
      </body>
    </html>
  )
}
