import db, { User } from '@play-money/database'
import { checkUsername } from './checkUsername'
import { getUserById } from './getUserById'

export async function updateUserById({
  id,
  username,
  displayName,
  bio,
  avatarUrl,
  timezone,
}: {
  id: string
  username?: string
  displayName?: string
  bio?: string
  avatarUrl?: string
  timezone?: string
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
  if (timezone) {
    updatedData.timezone = timezone
  }
  if (displayName) {
    updatedData.displayName = displayName
  }

  const updatedUser = await db.user.update({
    where: { id },
    data: updatedData,
  })

  return updatedUser
}
