import { PrismaClient, Prisma } from '@prisma/client'

declare global {
  var prisma: PrismaClient<typeof clientOptions>
}

export const clientOptions = {
  omit: {
    user: {
      email: true,
      emailVerified: true,
    },
  },
} satisfies Prisma.PrismaClientOptions

export type OmittedUserFields = {
  email: string
  emailVerified: Date | null
}

let prisma: PrismaClient<typeof clientOptions>

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient(clientOptions)
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient(clientOptions)
  }
  prisma = global.prisma
}

export default prisma
