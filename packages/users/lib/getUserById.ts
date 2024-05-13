import db from '@play-money/database'
import { UserNotFoundError } from './exceptions'
import { santizeUser } from './sanitizeUser'

export async function getUserById({ id }: { id: string }) {
  const user = await db.user.findUnique({
    where: {
      id,
    },
  })

  if (!user) {
    throw new UserNotFoundError(`User with id "${id}" not found`)
  }

  return santizeUser(user)
}
