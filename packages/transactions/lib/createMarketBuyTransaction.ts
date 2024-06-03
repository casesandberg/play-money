import _ from 'lodash'
import { checkAccountBalance } from '@play-money/accounts/lib/checkAccountBalance'
import { getAmmAccount } from '@play-money/accounts/lib/getAmmAccount'
import { getUserAccount } from '@play-money/accounts/lib/getUserAccount'
import { buy } from '@play-money/amms/lib/maniswap-v1'
import { TransactionItemInput, createTransaction } from './createTransaction'

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

  const hasEnoughBalance = await checkAccountBalance(userAccount.id, 'PRIMARY', amount)
  if (!hasEnoughBalance) {
    throw new Error('User does not have enough balance to make this purchase.')
  }

  let accumulatedTransactionItems: Array<TransactionItemInput> = []
  let amountToPurchase = amount

  while (amountToPurchase > 0) {
    let closestLimitOrder = {} as any // TODO: Implement limit order matching

    const ammTransactions = await buy({
      fromAccountId: userAccount.id,
      toAccountId: ammAccount.id,
      currencyCode: purchaseCurrencyCode,
      maxAmount: amountToPurchase,
      maxProbability: closestLimitOrder?.probability,
    })

    accumulatedTransactionItems.push(...ammTransactions)
    amountToPurchase += _.sumBy(ammTransactions, (item) =>
      item.currencyCode === 'PRIMARY' && item.accountId === userAccount.id ? item.amount : 0
    )
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
