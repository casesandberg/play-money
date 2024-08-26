import Decimal from 'decimal.js'
import { Transaction } from '@play-money/database'
import { UNIQUE_TRADER_BONUS_PRIMARY } from '@play-money/finance/economy'
import { executeTransaction } from '@play-money/finance/lib/executeTransaction'
import { getHouseAccount } from '@play-money/finance/lib/getHouseAccount'
import { getMarketLiquidity } from './getMarketLiquidity'
import { updateMarketBalances } from './updateMarketBalances'

export async function createMarketTraderBonusTransactions({
  marketId,
  initiatorId,
}: {
  marketId: string
  initiatorId: string
}) {
  const [houseAccount, liquidity] = await Promise.all([getHouseAccount(), getMarketLiquidity(marketId)])
  const amountToDistribute = new Decimal(UNIQUE_TRADER_BONUS_PRIMARY)
  const transactions: Array<Promise<Transaction>> = []

  for (const [accountId, providedAmount] of Object.entries(liquidity.providers)) {
    if (providedAmount.isZero()) continue

    const proportion = providedAmount.div(liquidity.total)
    const payout = amountToDistribute.mul(proportion).toDecimalPlaces(4)

    if (payout.isZero()) continue

    const entries = [
      {
        amount: payout,
        assetType: 'CURRENCY',
        assetId: 'PRIMARY',
        fromAccountId: houseAccount.id,
        toAccountId: accountId,
      } as const,
    ]

    transactions.push(
      executeTransaction({
        type: 'LIQUIDITY_VOLUME_BONUS',
        entries,
        marketId,
        additionalLogic: async (txParams) => updateMarketBalances({ ...txParams, marketId }),
      })
    )
  }

  // TODO: Handle dust

  return transactions
}
