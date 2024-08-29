import db from '@play-money/database'
import { UserNotFoundError } from '@play-money/users/lib/exceptions'

export async function getUserPrimaryAccount({ userId }: { userId: string }) {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      primaryAccount: true,
    },
  })

  if (!user) {
    throw new UserNotFoundError(`User with id "${userId}" not found`)
  }

  const account = user.primaryAccount

  if (!account) {
    throw new Error('User does not have a primary account')
  }

  return account
}
