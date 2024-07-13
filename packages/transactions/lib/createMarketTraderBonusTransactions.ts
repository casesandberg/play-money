import Decimal from 'decimal.js'
import _ from 'lodash'
import { getHouseAccount } from '@play-money/accounts/lib/getHouseAccount'
import { Transaction } from '@play-money/database'
import { UNIQUE_TRADER_BONUS_PRIMARY } from '@play-money/economy'
import { getMarketLiquidity } from '@play-money/markets/lib/getMarketLiquidity'
import { createTransaction } from './createTransaction'

export async function createMarketTraderBonusTransactions({ marketId }: { marketId: string }) {
  const houseAccount = await getHouseAccount()
  const amountToDistribute = new Decimal(UNIQUE_TRADER_BONUS_PRIMARY)
  const liquidity = await getMarketLiquidity(marketId)
  const transactions: Array<Transaction> = []

  for (const [accountId, providedAmount] of Object.entries(liquidity.providers)) {
    if (providedAmount.isZero()) continue

    const proportion = providedAmount.div(liquidity.total)
    const payout = amountToDistribute.mul(proportion).toDecimalPlaces(4)

    if (payout.isZero()) continue

    transactions.push(
      await createTransaction({
        creatorId: houseAccount.id,
        type: 'MARKET_TRADER_BONUS',
        description: `Unique trader bonus for market ${marketId}`,
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
    )
  }

  // TODO: Handle dust

  return transactions
}
