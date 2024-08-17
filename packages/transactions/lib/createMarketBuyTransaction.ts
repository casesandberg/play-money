import Decimal from 'decimal.js'
import _ from 'lodash'
import { getAmmAccount } from '@play-money/accounts/lib/getAmmAccount'
import { trade, quote } from '@play-money/amms/lib/maniswap-v1.1'
import { getBalances } from '@play-money/finance/lib/getBalances'
import { getUserPrimaryAccount } from '@play-money/finance/lib/getUserPrimaryAccount'
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
  const userAccount = await getUserPrimaryAccount({ userId })
  const ammAccount = await getAmmAccount({ marketId })
  const marketOption = await getMarketOption({ id: optionId, marketId })

  const ammBalances = await getBalances({ accountId: ammAccount.id, marketId })
  const ammAssetBalances = ammBalances.filter(({ assetType }) => assetType === 'MARKET_OPTION')

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

  while (outstandingShares.toDecimalPlaces(4).greaterThan(0) && maximumSaneLoops > 0) {
    let closestLimitOrder = {} as any // TODO: Implement limit order matching

    const amountToBuy = closestLimitOrder?.probability
      ? (
          await quote({
            amount: outstandingShares,
            probability: closestLimitOrder?.probability ?? 0.99,
            targetShare: ammAssetBalances.find((balance) => balance.assetId === marketOption.id)!.amount,
            shares: ammAssetBalances.map((balance) => balance.amount),
          })
        ).cost
      : outstandingShares

    const returnedShares = await trade({
      isBuy: true,
      amount: amountToBuy,
      targetShare: ammAssetBalances.find((balance) => balance.assetId === marketOption.id)!.amount,
      shares: ammAssetBalances.map((balance) => balance.amount),
    })

    const oppositeCurrencyCode = marketOption.currencyCode === 'YES' ? 'NO' : 'YES'

    accumulatedTransactionItems.push(
      // Giving the shares to the AMM.
      { accountId: userAccount.id, currencyCode: marketOption.currencyCode, amount: amountToBuy.neg() },
      { accountId: userAccount.id, currencyCode: oppositeCurrencyCode, amount: amountToBuy.neg() },
      { accountId: ammAccount.id, currencyCode: marketOption.currencyCode, amount: amountToBuy },
      { accountId: ammAccount.id, currencyCode: oppositeCurrencyCode, amount: amountToBuy },

      // Returning purchased shares to the user.
      { accountId: ammAccount.id, currencyCode: marketOption.currencyCode, amount: returnedShares.neg() },
      { accountId: userAccount.id, currencyCode: marketOption.currencyCode, amount: returnedShares }
    )

    outstandingShares = outstandingShares.sub(amountToBuy)
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
