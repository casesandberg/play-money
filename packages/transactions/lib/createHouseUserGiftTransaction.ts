import Decimal from 'decimal.js'
import _ from 'lodash'
import { getHouseAccount } from '@play-money/accounts/lib/getHouseAccount'
import { getUserAccount } from '@play-money/accounts/lib/getUserAccount'
import { createTransaction } from './createTransaction'

interface HouseUserGiftTransactionInput {
  userId: string
  amount: Decimal // in dollars
  creatorId: string
}

export async function createHouseUserGiftTransaction({ userId, amount, creatorId }: HouseUserGiftTransactionInput) {
  const userAccount = await getUserAccount({ id: userId })
  const creatorAccount = await getUserAccount({ id: creatorId })
  const houseAccount = await getHouseAccount()

  const transaction = await createTransaction({
    creatorId: creatorAccount.id,
    type: 'HOUSE_USER_GIFT',
    description: `House gift of ${amount} dollars`,
    marketId: null,
    transactionItems: [
      {
        accountId: houseAccount.id,
        currencyCode: 'PRIMARY',
        amount: amount.neg(),
      },
      {
        accountId: userAccount.id,
        currencyCode: 'PRIMARY',
        amount: amount,
      },
    ],
  })

  return transaction
}
