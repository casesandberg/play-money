import NextAuth from 'next-auth'
import Resend from 'next-auth/providers/resend'
import db from '@play-money/database'
import { PrismaAdapter } from './auth-prisma-adapter'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  pages: {
    signIn: '/login',
    error: '/login',
    verifyRequest: '/check-email',
  },
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  providers: [
    Resend({
      from: 'case@casesandberg.com',
    }),
  ],
})
