import Decimal from 'decimal.js'
import _ from 'lodash'
import { getHouseAccount } from '@play-money/accounts/lib/getHouseAccount'
import { DAILY_MARKET_BONUS_PRIMARY } from '@play-money/economy'
import { createTransaction } from '@play-money/transactions/lib/createTransaction'

export async function createDailyMarketBonusTransaction({
  accountId,
  marketId,
}: {
  accountId: string
  marketId: string
}) {
  const houseAccount = await getHouseAccount()
  const payout = new Decimal(DAILY_MARKET_BONUS_PRIMARY)

  const transaction = await createTransaction({
    creatorId: accountId,
    type: 'DAILY_MARKET_BONUS',
    description: `Daily market bonus for market ${marketId}`,
    marketId,
    transactionItems: [
      {
        accountId: houseAccount.id,
        currencyCode: 'PRIMARY',
        amount: payout.negated(),
      },
      {
        accountId: accountId,
        currencyCode: 'PRIMARY',
        amount: payout,
      },
    ],
  })

  return transaction
}
