import Decimal from 'decimal.js'
import { Transaction } from '@play-money/database'
import { LIQUIDITY_VOLUME_BONUS_PERCENT } from '@play-money/finance/economy'
import { executeTransaction } from '@play-money/finance/lib/executeTransaction'
import { getHouseAccount } from '@play-money/finance/lib/getHouseAccount'
import { getMarketLiquidity } from './getMarketLiquidity'
import { updateMarketBalances } from './updateMarketBalances'

export async function createLiquidityVolumeBonusTransaction({
  marketId,
  amountTraded,
}: {
  marketId: string
  amountTraded: Decimal
}) {
  const [houseAccount, liquidity] = await Promise.all([getHouseAccount(), getMarketLiquidity(marketId)])
  const amountToDistribute = amountTraded.times(LIQUIDITY_VOLUME_BONUS_PERCENT)
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
