import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { auth } from '@play-money/auth'
import { SessionProvider } from '@play-money/auth/components/SessionProvider'
import '@play-money/ui/styles.css'
import { Toaster } from '@play-money/ui/toaster'
import { UserProvider } from '@play-money/users/context/UserContext'
import { getUserById } from '@play-money/users/lib/getUserById'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Play Money',
  description: 'Prediction market platform',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const user = session?.user?.id ? await getUserById({ id: session.user.id }) : null

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <UserProvider user={user}>{children}</UserProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  )
}
