import type { Metadata } from 'next'
import { Work_Sans } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900']
})

export const metadata: Metadata = {
  title: 'BrendAI - Automated Brand Merchandise Design',
  description: 'Transform your website into custom branded merchandise designs in minutes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={workSans.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
