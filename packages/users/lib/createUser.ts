import { generateFromEmail } from 'unique-username-generator'
import db from '@play-money/database'
import { UserExistsError } from './exceptions'

export async function createUser({ email }: { email: string }) {
  const existingUser = await db.user.findUnique({
    where: {
      email,
    },
  })

  if (existingUser) {
    throw new UserExistsError()
  }

  const name = generateFromEmail(email, 4)

  const user = await db.user.create({
    data: {
      email: email,
      username: name,
      displayName: name,
    },
  })

  return {
    id: user.id,
    email: user.email, // TODO dont leak emails
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${user.username}&scale=75`,
    bio: user.bio,
  }
}
