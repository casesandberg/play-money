import Decimal from 'decimal.js'
import { generateFromEmail } from 'unique-username-generator'
import db from '@play-money/database'
import { User } from '@play-money/database'
import { OmittedUserFields } from '@play-money/database/prisma'
import { INITIAL_USER_BALANCE_PRIMARY } from '@play-money/economy'
import { createHouseUserGiftTransaction } from '@play-money/transactions/lib/createHouseUserGiftTransaction'
import { UserExistsError } from './exceptions'

export async function createUser({ email }: { email: string }): Promise<User & OmittedUserFields> {
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
      accounts: {
        create: {},
      },
    },
  })

  await createHouseUserGiftTransaction({
    userId: user.id,
    creatorId: user.id,
    amount: new Decimal(INITIAL_USER_BALANCE_PRIMARY),
  })

  return user as User & OmittedUserFields
}
