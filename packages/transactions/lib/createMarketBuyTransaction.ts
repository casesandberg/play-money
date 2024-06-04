import _ from 'lodash'
import { checkAccountBalance } from '@play-money/accounts/lib/checkAccountBalance'
import { getAmmAccount } from '@play-money/accounts/lib/getAmmAccount'
import { getUserAccount } from '@play-money/accounts/lib/getUserAccount'
import { buy, costToHitProbability } from '@play-money/amms/lib/maniswap-v1'
import { CurrencyCodeType } from '@play-money/database/zod/inputTypeSchemas/CurrencyCodeSchema'
import { TransactionItemInput, createTransaction } from './createTransaction'
import { convertPrimaryToMarketShares } from './exchanger'

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
  const userAccount = await getUserAccount({ id: userId })
  const ammAccount = await getAmmAccount({ marketId })

  const exchangerTransactions = await convertPrimaryToMarketShares({
    fromAccountId: userAccount.id,
    amount,
  })

  let maximumSaneLoops = 100
  let accumulatedTransactionItems: Array<TransactionItemInput> = [...exchangerTransactions]
  let oppositeCurrencyCode = purchaseCurrencyCode === 'YES' ? 'NO' : 'YES'
  let oppositeOutstandingShares = amount

  while (oppositeOutstandingShares > 0 && maximumSaneLoops > 0) {
    let closestLimitOrder = {} as any // TODO: Implement limit order matching

    const amountToBuy = closestLimitOrder?.probability
      ? await costToHitProbability({
          probability: closestLimitOrder?.probability,
          maxAmount: oppositeOutstandingShares,
        })
      : oppositeOutstandingShares

    const ammTransactions = await buy({
      fromAccountId: userAccount.id,
      ammAccountId: ammAccount.id,
      currencyCode: purchaseCurrencyCode,
      amount: amountToBuy,
    })

    accumulatedTransactionItems.push(...ammTransactions)
    oppositeOutstandingShares += _.sumBy(ammTransactions, (item) =>
      item.currencyCode === oppositeCurrencyCode && item.accountId === userAccount.id ? item.amount : 0
    )
    maximumSaneLoops -= 1
  }

  if (maximumSaneLoops === 0) {
    console.log('Maximum sane loops reached')
  }

  const transaction = await createTransaction({
    creatorId: userId,
    type: 'MARKET_BUY',
    description: `Purchase ${amount} dollars worth of ${purchaseCurrencyCode} shares in market ${marketId}`,
    marketId,
    transactionItems: accumulatedTransactionItems,
  })

  return transaction
}
