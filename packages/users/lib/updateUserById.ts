import db, { User } from '@play-money/database'
import { checkUsername } from './checkUsername'
import { getUserById } from './getUserById'
import { sanitizeUser } from './sanitizeUser'

export async function updateUserById({
  id,
  username,
  bio,
  avatarUrl,
}: {
  id: string
  username?: string
  bio?: string
  avatarUrl?: string
}) {
  const user = await getUserById({ id })

  const updatedData: Partial<User> = {}

  if (username && user.username !== username) {
    const { available, message } = await checkUsername({ username })
    if (!available) {
      throw new Error(message)
    }

    updatedData.username = username
  }
  if (bio) {
    updatedData.bio = bio
  }
  if (avatarUrl) {
    updatedData.avatarUrl = avatarUrl
  }

  const updatedUser = await db.user.update({
    where: { id },
    data: updatedData,
  })

  return sanitizeUser(updatedUser)
}
