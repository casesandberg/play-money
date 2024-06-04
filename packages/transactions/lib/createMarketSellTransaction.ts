import _ from 'lodash'
import { getAmmAccount } from '@play-money/accounts/lib/getAmmAccount'
import { getUserAccount } from '@play-money/accounts/lib/getUserAccount'
import { costToHitProbability, sell } from '@play-money/amms/lib/maniswap-v1'
import { createTransaction, TransactionItemInput } from './createTransaction'
import { convertMarketSharesToPrimary, convertPrimaryToMarketShares } from './exchanger'

type MarketSellTransactionInput = {
  userId: string
  amount: number // in shares
  sellCurrencyCode: 'YES' | 'NO'
  marketId: string
}

export async function createMarketSellTransaction({
  userId,
  marketId,
  amount,
  sellCurrencyCode,
}: MarketSellTransactionInput) {
  const userAccount = await getUserAccount({ id: userId })
  const ammAccount = await getAmmAccount({ marketId })

  // When selling shares, the number of shares will decrease some by filling amm/limit orders.
  // We need an equilivant number of yes and no shares to get money back out of the exchanger.
  let outstandingShares = amount
  let oppositeOutstandingShares = 0
  let oppositeCurrencyCode = sellCurrencyCode === 'YES' ? 'NO' : 'YES'
  let accumulatedTransactionItems: Array<TransactionItemInput> = []
  // To account for floating point errors, we will limit the number of loops to a sane number.
  let maximumSaneLoops = 100

  while (outstandingShares !== oppositeOutstandingShares && maximumSaneLoops > 0) {
    let closestLimitOrder = {} as any // TODO: Implement limit order matching

    const amountToSell = closestLimitOrder?.probability
      ? (
          await costToHitProbability({
            ammAccountId: ammAccount.id,
            probability: closestLimitOrder?.probability,
            maxAmount: outstandingShares,
          })
        ).cost
      : outstandingShares

    const ammTransactions = await sell({
      fromAccountId: userAccount.id,
      ammAccountId: ammAccount.id,
      currencyCode: sellCurrencyCode,
      amount: amountToSell,
    })

    accumulatedTransactionItems.push(...ammTransactions)
    outstandingShares += _.sumBy(ammTransactions, (item) =>
      item.currencyCode === sellCurrencyCode && item.accountId === userAccount.id ? item.amount : 0
    )
    oppositeOutstandingShares += _.sumBy(ammTransactions, (item) =>
      item.currencyCode === oppositeCurrencyCode && item.accountId === userAccount.id ? item.amount : 0
    )
    maximumSaneLoops -= 1
  }

  const exchangerTransactions = await convertMarketSharesToPrimary({
    fromAccountId: userAccount.id,
    amount,
  })
  accumulatedTransactionItems.push(...exchangerTransactions)

  if (maximumSaneLoops === 0) {
    console.log('Maximum sane loops reached')
  }

  const transaction = await createTransaction({
    creatorId: userId,
    type: 'MARKET_SELL',
    description: `Sell ${amount} shares worth of ${sellCurrencyCode} in market ${marketId}`,
    marketId,
    transactionItems: accumulatedTransactionItems,
  })

  return transaction
}
