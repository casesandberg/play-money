import bcrypt from 'bcryptjs'
import { generateFromEmail } from 'unique-username-generator'
import db from '@play-money/database'
import { UserExistsError } from './exceptions'

export async function registerUser({ email, password }: { email: string; password: string }) {
  const existingUser = await db.user.findUnique({
    where: {
      email,
    },
  })

  if (existingUser) {
    throw new UserExistsError()
  }

  const salt = bcrypt.genSaltSync(10)
  const hashedPassword = bcrypt.hashSync(password, salt)

  const user = await db.user.create({
    data: {
      email: email,
      password: hashedPassword,
      username: generateFromEmail(email, 3),
    },
  })

  return {
    id: user.id,
    email: user.email,
  }
}
