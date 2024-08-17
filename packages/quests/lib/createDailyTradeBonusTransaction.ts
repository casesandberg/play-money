import Decimal from 'decimal.js'
import _ from 'lodash'
import { DAILY_TRADE_BONUS_PRIMARY } from '@play-money/finance/economy'
import { getHouseAccount } from '@play-money/finance/lib/getHouseAccount'
import { createTransaction } from '@play-money/transactions/lib/createTransaction'

export async function createDailyTradeBonusTransaction({
  accountId,
  marketId,
}: {
  accountId: string
  marketId: string
}) {
  const houseAccount = await getHouseAccount()
  const payout = new Decimal(DAILY_TRADE_BONUS_PRIMARY)

  const transaction = await createTransaction({
    creatorId: accountId,
    type: 'DAILY_TRADE_BONUS',
    description: `Daily trade bonus for market ${marketId}`,
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
