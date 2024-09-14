import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { SWRProvider } from '@play-money/api-helpers/components/SWRProvider'
import { auth } from '@play-money/auth'
import { SessionProvider } from '@play-money/auth/components/SessionProvider'
import { EditorExtensions } from '@play-money/comments/components/EditorExtensions'
import { ThemeProvider } from '@play-money/ui/ThemeProvider'
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const user = session?.user?.id ? await getUserById({ id: session.user.id }) : null

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
          <SWRProvider>
            <SessionProvider session={session}>
              <UserProvider user={user}>
                <EditorExtensions>
                  <TooltipProvider>{children}</TooltipProvider>
                </EditorExtensions>
              </UserProvider>
            </SessionProvider>
            <Toaster />
          </SWRProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
