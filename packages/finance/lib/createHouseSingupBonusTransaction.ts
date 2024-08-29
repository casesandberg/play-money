import Decimal from 'decimal.js'
import { INITIAL_USER_BALANCE_PRIMARY } from '@play-money/finance/economy'
import { getHouseAccount } from '@play-money/finance/lib/getHouseAccount'
import { getUserPrimaryAccount } from '@play-money/users/lib/getUserPrimaryAccount'
import { executeTransaction } from './executeTransaction'

export async function createHouseSingupBonusTransaction({ userId }: { userId: string }) {
  const [userAccount, houseAccount] = await Promise.all([getUserPrimaryAccount({ userId }), getHouseAccount()])

  const entries = [
    {
      amount: new Decimal(INITIAL_USER_BALANCE_PRIMARY),
      assetType: 'CURRENCY',
      assetId: 'PRIMARY',
      fromAccountId: houseAccount.id,
      toAccountId: userAccount.id,
    } as const,
  ]

  const transaction = await executeTransaction({
    type: 'HOUSE_SIGNUP_BONUS',
    entries,
  })

  return transaction
}
