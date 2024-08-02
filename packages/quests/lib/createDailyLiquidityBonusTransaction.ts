import Decimal from 'decimal.js'
import _ from 'lodash'
import { getHouseAccount } from '@play-money/accounts/lib/getHouseAccount'
import { DAILY_LIQUIDITY_BONUS_PRIMARY } from '@play-money/economy'
import { createTransaction } from '@play-money/transactions/lib/createTransaction'

export async function createDailyLiquidityBonusTransaction({
  accountId,
  marketId,
}: {
  accountId: string
  marketId: string
}) {
  const houseAccount = await getHouseAccount()
  const payout = new Decimal(DAILY_LIQUIDITY_BONUS_PRIMARY)

  const transaction = await createTransaction({
    creatorId: accountId,
    type: 'DAILY_LIQUIDITY_BONUS',
    description: `Daily liquidity bonus for market ${marketId}`,
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
