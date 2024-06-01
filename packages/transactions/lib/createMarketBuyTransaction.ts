import _ from 'lodash'
import { buy } from '@play-money/amms/lib/maniswap-v1'
import { getMarket } from '@play-money/markets/lib/getMarket'
import { TransactionItemInput, createTransaction } from './createTransaction'
import { checkUserBalance } from './getUserBalances'

interface MarketBuyTransactionInput {
  userId: string
  amount: number // in dollars
  purchaseCurrencyCode: 'YES' | 'NO'
  marketId: string
}

export async function createMarketBuyTransaction({
  userId,
  marketId,
  amount,
  purchaseCurrencyCode,
}: MarketBuyTransactionInput) {
  const market = await getMarket({ id: marketId })

  const hasEnoughBalance = await checkUserBalance(userId, 'PRIMARY', amount)
  if (!hasEnoughBalance) {
    throw new Error('User does not have enough balance to make this purchase.')
  }

  let accumulatedTransactionItems: Array<TransactionItemInput> = []
  let amountToPurchase = amount

  while (amountToPurchase > 0) {
    let closestLimitOrder = {} as any // TODO: Implement limit order matching

    const ammTransactions = await buy({
      fromId: userId,
      toId: market.ammId,
      currencyCode: purchaseCurrencyCode,
      maxAmount: amountToPurchase,
      maxProbability: closestLimitOrder?.probability,
    })

    accumulatedTransactionItems.push(...ammTransactions)
    amountToPurchase += _.sumBy(ammTransactions, (item) =>
      item.currencyCode === 'PRIMARY' && item.userId === userId ? item.amount : 0
    )
  }

  const transaction = await createTransaction({
    creatorId: userId,
    type: 'MARKET_BUY',
    description: `Purchase ${amount} dollars worth of ${purchaseCurrencyCode} shares in market ${marketId}`,
    marketId: market.id,
    transactionItems: accumulatedTransactionItems,
  })

  return transaction
}
