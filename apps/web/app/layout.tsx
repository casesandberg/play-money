import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SWRProvider } from '@play-money/api-helpers/components/SWRProvider'
import { auth } from '@play-money/auth'
import { SessionProvider } from '@play-money/auth/components/SessionProvider'
import { CurrencyProvider } from '@play-money/currencies/components/CurrencyProvider'
import type { Currency } from '@play-money/database'
import '@play-money/ui/emoji'
import '@play-money/ui/styles.css'
import { Toaster } from '@play-money/ui/toaster'
import { TooltipProvider } from '@play-money/ui/tooltip'
import { UserProvider } from '@play-money/users/context/UserContext'
import { getUserById } from '@play-money/users/lib/getUserById'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Play Money',
  description: 'Prediction market platform',
}

// TODO: @casesandberg Generate this from OpenAPI schema
export async function getCurrencies() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/currencies`, {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error('There was an error fetching data')
  }

  return res.json() as Promise<{ currencies: Array<Currency> }>
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const user = session?.user?.id ? await getUserById({ id: session.user.id }) : null
  const { currencies } = await getCurrencies()

  return (
    <html lang="en">
      <body className={inter.className}>
        <SWRProvider>
          <SessionProvider session={session}>
            <UserProvider user={user}>
              <CurrencyProvider currencies={currencies}>
                <TooltipProvider>{children}</TooltipProvider>
              </CurrencyProvider>
            </UserProvider>
          </SessionProvider>
          <Toaster />
        </SWRProvider>
      </body>
    </html>
  )
}
