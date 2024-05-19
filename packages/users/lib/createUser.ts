import { generateFromEmail } from 'unique-username-generator'
import db from '@play-money/database'
import { UserExistsError } from './exceptions'
import { sanitizeUser } from './sanitizeUser'

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

  return sanitizeUser(user)
}
