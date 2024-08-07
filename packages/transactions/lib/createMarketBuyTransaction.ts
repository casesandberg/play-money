import Decimal from 'decimal.js'
import _ from 'lodash'
import { getAmmAccount } from '@play-money/accounts/lib/getAmmAccount'
import { getUserAccount } from '@play-money/accounts/lib/getUserAccount'
import { buy, costToHitProbability } from '@play-money/amms/lib/maniswap-v1'
import { getMarketOption } from '@play-money/markets/lib/getMarketOption'
import { createTransaction, TransactionItemInput } from './createTransaction'
import { convertPrimaryToMarketShares } from './exchanger'

interface MarketBuyTransactionInput {
  userId: string
  amount: Decimal
  marketId: string
  optionId: string
}

export async function createMarketBuyTransaction({ userId, amount, marketId, optionId }: MarketBuyTransactionInput) {
  const userAccount = await getUserAccount({ id: userId })
  const ammAccount = await getAmmAccount({ marketId })
  const marketOption = await getMarketOption({ id: optionId, marketId })

  const exchangerTransactions = await convertPrimaryToMarketShares({
    fromAccountId: userAccount.id,
    amount,
  })

  // When buying shares, the other options' shares will decrease when filling amm/limit orders.
  // Any amount of other shares left means the entire amount has not yet been been filled.
  let outstandingShares = amount
  let accumulatedTransactionItems: Array<TransactionItemInput> = [...exchangerTransactions]
  // To account for floating point errors, we will limit the number of loops to a sane number.
  let maximumSaneLoops = 100

  while (outstandingShares.greaterThan(0) && maximumSaneLoops > 0) {
    let closestLimitOrder = {} as any // TODO: Implement limit order matching

    const amountToBuy = closestLimitOrder?.probability
      ? (
          await costToHitProbability({
            ammAccountId: ammAccount.id,
            probability: closestLimitOrder?.probability,
            maxAmount: outstandingShares,
          })
        ).cost
      : outstandingShares

    const ammTransactions = await buy({
      fromAccountId: userAccount.id,
      ammAccountId: ammAccount.id,
      assetType: 'MARKET_OPTION',
      assetId: optionId,
      amount: amountToBuy,
    })

    accumulatedTransactionItems.push(...ammTransactions)

    const transactionsByUserOfAlternateCurrency = ammTransactions.filter(
      (item) =>
        ![marketOption.currencyCode, 'PRIMARY', 'LPB'].includes(item.currencyCode) && item.accountId === userAccount.id
    )
    outstandingShares = outstandingShares.add(
      transactionsByUserOfAlternateCurrency.reduce((sum, item) => sum.plus(item.amount), new Decimal(0))
    )

    maximumSaneLoops -= 1
  }

  if (maximumSaneLoops === 0) {
    console.log('Maximum sane loops reached')
  }

  const transaction = await createTransaction({
    creatorId: userAccount.id,
    type: 'MARKET_BUY',
    description: `Purchase ${amount} dollars of option ${optionId} in market ${marketId}`,
    marketId,
    transactionItems: accumulatedTransactionItems,
  })

  return transaction
}
