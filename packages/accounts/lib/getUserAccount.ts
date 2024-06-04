import db from '@play-money/database'
import { UserNotFoundError } from '@play-money/users/lib/exceptions'

export async function getUserAccount({ id }: { id: string }) {
  const user = await db.user.findUnique({
    where: {
      id,
    },
    include: {
      accounts: true,
    },
  })

  if (!user) {
    throw new UserNotFoundError(`User with id "${id}" not found`)
  }

  const account = user.accounts[0]

  if (!account) {
    throw new Error('User does not have an account')
  }

  return account
}
