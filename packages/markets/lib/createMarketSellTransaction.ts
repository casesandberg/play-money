import Decimal from 'decimal.js'
import { executeTransaction } from '@play-money/finance/lib/executeTransaction'
import { executeTrade } from './executeTrade'
import { updateMarketBalances } from './updateMarketBalances'
import { updateMarketOptionProbabilities } from './updateMarketOptionProbabilities'
import { updateMarketPosition } from './updateMarketPosition'
import { updateMarketPositionValues } from './updateMarketPositionValues'

export async function createMarketSellTransaction({
  initiatorId,
  accountId,
  amount,
  marketId,
  optionId,
}: {
  initiatorId: string
  accountId: string
  amount: Decimal
  marketId: string
  optionId: string
}) {
  const entries = await executeTrade({
    accountId,
    amount,
    marketId,
    optionId,
    isBuy: false,
  })

  const transaction = await executeTransaction({
    type: 'TRADE_SELL',
    initiatorId,
    entries,
    marketId,
    optionIds: [optionId],
    additionalLogic: async (txParams) => {
      // Create or update the position before we value it
      await updateMarketPosition({ ...txParams, marketId, accountId, optionId })

      const [balances] = await Promise.all([
        updateMarketBalances({ ...txParams, marketId }),
        updateMarketPositionValues({ ...txParams, marketId }),
        // Update the liquidity count cache
        txParams.tx.market.update({
          where: {
            id: marketId,
          },
          data: {
            liquidityCount: {
              decrement: amount,
            },
          },
        }),
      ])

      await updateMarketOptionProbabilities({ ...txParams, balances })
    },
  })

  return transaction
}
