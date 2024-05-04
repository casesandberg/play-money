import { auth } from '@play-money/auth'
import { SessionProvider } from '@play-money/auth/components/SessionProvider'
import './globals.css'
import '@play-money/ui/styles.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@play-money/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Play Money',
  description: 'Prediction market platform',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>{children}</SessionProvider>
        <Toaster />
      </body>
    </html>
  )
}
