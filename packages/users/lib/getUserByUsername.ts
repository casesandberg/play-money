import db from '@play-money/database'
import { UserNotFoundError } from './exceptions'

export async function getUserByUsername({ username }: { username: string }) {
  const user = await db.user.findUnique({
    where: {
      username,
    },
  })

  if (!user) {
    throw new UserNotFoundError(`User with username "${username}" not found`)
  }

  return {
    id: user.id,
    email: user.email, // TODO dont leak emails
    username: user.username,
    avatarUrl: user.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${user.username}&scale=75`,
  }
}
