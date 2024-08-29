import Decimal from 'decimal.js'
import { DAILY_MARKET_BONUS_PRIMARY } from '@play-money/finance/economy'
import { executeTransaction } from '@play-money/finance/lib/executeTransaction'
import { getHouseAccount } from '@play-money/finance/lib/getHouseAccount'

export async function createDailyMarketBonusTransaction({
  accountId,
  initiatorId,
  marketId,
}: {
  accountId: string
  initiatorId: string
  marketId: string
}) {
  const houseAccount = await getHouseAccount()
  const payout = new Decimal(DAILY_MARKET_BONUS_PRIMARY)

  const entries = [
    {
      amount: payout,
      assetType: 'CURRENCY',
      assetId: 'PRIMARY',
      fromAccountId: houseAccount.id,
      toAccountId: accountId,
    } as const,
  ]

  const transaction = await executeTransaction({
    type: 'DAILY_MARKET_BONUS',
    initiatorId,
    entries,
    marketId,
  })

  return transaction
}
