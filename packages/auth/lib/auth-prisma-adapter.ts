// Copied and modified from: https://github.com/nextauthjs/next-auth/blob/main/packages/adapter-prisma/src/index.ts
import type { Adapter, AdapterAccount, AdapterSession, AdapterUser } from '@auth/core/adapters'
import type { PrismaClient, Prisma } from '@prisma/client'
import { clientOptions } from '@play-money/database/prisma'
import { createUser } from '@play-money/users/lib/createUser'

export function PrismaAdapter(
  prisma: PrismaClient<typeof clientOptions> | ReturnType<PrismaClient['$extends']>
): Adapter {
  const p = prisma as unknown as PrismaClient
  return {
    // We need to let Prisma generate the ID because our default UUID is incompatible with MongoDB
    createUser: ({ id: _id, ...data }) => {
      return createUser({ email: data.email })
    },
    getUser: (id) => p.user.findUnique({ where: { id }, select: { id: true, email: true, emailVerified: true } }),
    getUserByEmail: (email) =>
      p.user.findUnique({ where: { email }, select: { id: true, email: true, emailVerified: true } }),
    async getUserByAccount(provider_providerAccountId) {
      const account = await p.authAccount.findUnique({
        where: { provider_providerAccountId },
        select: { user: true },
      })
      return (account?.user as AdapterUser) ?? null
    },
    updateUser: ({ id, ...data }) => p.user.update({ where: { id }, data }) as Promise<AdapterUser>,
    deleteUser: (id) => p.user.delete({ where: { id } }) as Promise<AdapterUser>,
    linkAccount: (data) => p.authAccount.create({ data }) as unknown as AdapterAccount,
    unlinkAccount: (provider_providerAccountId) =>
      p.authAccount.delete({
        where: { provider_providerAccountId },
      }) as unknown as AdapterAccount,
    async getSessionAndUser(sessionToken) {
      const userAndSession = await p.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      })
      if (!userAndSession) return null
      const { user, ...session } = userAndSession
      return { user, session } as { user: AdapterUser; session: AdapterSession }
    },
    createSession: (data) => p.session.create({ data }),
    updateSession: (data) => p.session.update({ where: { sessionToken: data.sessionToken }, data }),
    deleteSession: (sessionToken) => p.session.delete({ where: { sessionToken } }),
    async createVerificationToken(data) {
      const verificationToken = await p.verificationToken.create({ data })
      // @ts-expect-errors // MongoDB needs an ID, but we don't
      if (verificationToken.id) delete verificationToken.id
      return verificationToken
    },
    async useVerificationToken(identifier_token) {
      try {
        const verificationToken = await p.verificationToken.delete({
          where: { identifier_token },
        })
        // @ts-expect-errors // MongoDB needs an ID, but we don't
        if (verificationToken.id) delete verificationToken.id
        return verificationToken
      } catch (error) {
        // If token already used/deleted, just return null
        // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
        if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') return null
        throw error
      }
    },
    async getAccount(providerAccountId, provider) {
      return p.authAccount.findFirst({
        where: { providerAccountId, provider },
      }) as Promise<AdapterAccount | null>
    },
  }
}
