import db from '@play-money/database'
import { UserNotFoundError } from './exceptions'

export async function getUserById({ id }: { id: string }) {
  const user = await db.user.findUnique({
    where: {
      id,
    },
  })

  if (!user) {
    throw new UserNotFoundError(`User with id "${id}" not found`)
  }

  return {
    id: user.id,
    email: user.email, // TODO dont leak emails
    username: user.username,
    avatarUrl: user.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${user.username}&scale=75`,
    bio: user.bio,
  }
}
