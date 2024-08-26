import Decimal from 'decimal.js'
import { getHouseAccount } from '@play-money/finance/lib/getHouseAccount'
import { getUserPrimaryAccount } from '@play-money/users/lib/getUserPrimaryAccount'
import { executeTransaction } from './executeTransaction'

export async function createHouseUserGiftTransaction({
  userId,
  amount,
  initiatorId,
}: {
  userId: string
  amount: Decimal // in dollars
  initiatorId: string
}) {
  const [userAccount, houseAccount] = await Promise.all([getUserPrimaryAccount({ userId }), getHouseAccount()])

  const entries = [
    {
      amount: amount,
      assetType: 'CURRENCY',
      assetId: 'PRIMARY',
      fromAccountId: houseAccount.id,
      toAccountId: userAccount.id,
    } as const,
  ]

  const transaction = await executeTransaction({
    type: 'HOUSE_GIFT',
    entries,
  })

  return transaction
}
