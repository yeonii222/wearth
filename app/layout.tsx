import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'WEARTH — 오늘 날씨, 오늘 코디',
  description:
    '날씨를 알면 스타일이 보입니다. 매일 아침, 당신의 날씨에 맞는 완벽한 코디를 제안해드립니다.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`${geist.variable} antialiased`}>
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
