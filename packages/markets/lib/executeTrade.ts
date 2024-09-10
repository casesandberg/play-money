import Decimal from 'decimal.js'
import { trade, quote } from '@play-money/finance/amms/maniswap-v1.1'
import { getBalance, getMarketBalances } from '@play-money/finance/lib/getBalances'
import { getHouseAccount } from '@play-money/finance/lib/getHouseAccount'
import { calculateRealizedGainsTax } from '@play-money/finance/lib/helpers'
import { TransactionEntryInput } from '@play-money/finance/types'
import { getMarketOptionPosition } from '@play-money/users/lib/getMarketOptionPosition'
import { getMarketAmmAccount } from './getMarketAmmAccount'
import { getMarketClearingAccount } from './getMarketClearingAccount'

export async function executeTrade({
  accountId,
  amount,
  marketId,
  optionId,
  isBuy,
}: {
  accountId: string
  amount: Decimal
  marketId: string
  optionId: string
  isBuy: boolean
}): Promise<Array<TransactionEntryInput>> {
  const [ammAccount, clearingAccount] = await Promise.all([
    getMarketAmmAccount({ marketId }),
    getMarketClearingAccount({ marketId }),
  ])

  const [balanceToTrade, ammBalances] = await Promise.all([
    isBuy
      ? getBalance({ accountId, assetType: 'CURRENCY', assetId: 'PRIMARY' })
      : getBalance({ accountId, assetType: 'MARKET_OPTION', assetId: optionId, marketId }),
    getMarketBalances({ accountId: ammAccount.id, marketId }),
  ])

  if (!balanceToTrade.total.gte(amount)) {
    throw new Error(
      isBuy ? 'User does not have enough balance to purchase' : 'User does not have enough option shares to sell'
    )
  }
  const ammAssetBalances = ammBalances.filter(({ assetType }) => assetType === 'MARKET_OPTION')

  const marketOptionBalance = ammAssetBalances.find((balance) => balance.assetId === optionId)
  if (!marketOptionBalance) {
    throw new Error('Cannot find option to trade')
  }

  const entries: Array<TransactionEntryInput> = isBuy
    ? [
        {
          amount,
          assetType: 'CURRENCY',
          assetId: 'PRIMARY',
          fromAccountId: accountId,
          toAccountId: clearingAccount.id,
        },
        ...ammAssetBalances.map((balance) => {
          return {
            amount,
            assetType: 'MARKET_OPTION',
            assetId: balance.assetId,
            fromAccountId: clearingAccount.id,
            toAccountId: ammAccount.id,
          } as const
        }),
      ]
    : []

  // When buying shares, the other options' shares will decrease when filling amm/limit orders.
  // Any amount of other shares left means the entire amount has not yet been been filled.
  let outstandingShares = amount
  let receivedShares = new Decimal(0)
  let maximumSaneLoops = 100
  while (outstandingShares.toDecimalPlaces(4).greaterThan(0) && maximumSaneLoops > 0) {
    let closestLimitOrder = {} as any // TODO: Implement limit order matching

    const amountToTrade = closestLimitOrder?.probability
      ? (
          await quote({
            amount: outstandingShares,
            probability: closestLimitOrder?.probability ?? (isBuy ? 0.99 : 0.01),
            targetShare: marketOptionBalance.total,
            shares: ammAssetBalances.map((balance) => balance.total),
          })
        ).cost
      : outstandingShares

    const returnedShares = await trade({
      isBuy,
      amount: amountToTrade,
      targetShare: marketOptionBalance.total,
      shares: ammAssetBalances.map((balance) => balance.total),
    })

    entries.push(
      isBuy
        ? {
            amount: returnedShares,
            assetType: 'MARKET_OPTION',
            assetId: optionId,
            fromAccountId: ammAccount.id,
            toAccountId: accountId,
          }
        : {
            amount: amountToTrade,
            assetType: 'MARKET_OPTION',
            assetId: optionId,
            fromAccountId: accountId,
            toAccountId: ammAccount.id,
          }
    )

    outstandingShares = outstandingShares.sub(amountToTrade)
    receivedShares = receivedShares.add(returnedShares)
    maximumSaneLoops -= 1
  }

  if (!isBuy) {
    const [position, houseAccount] = await Promise.all([
      getMarketOptionPosition({ accountId, optionId }),
      getHouseAccount(),
    ])

    if (!position) {
      throw new Error('User does not have position in market')
    }

    const tax = calculateRealizedGainsTax({ cost: position.cost, salePrice: receivedShares })

    entries.push(
      ...ammAssetBalances.map((balance) => {
        return {
          amount: receivedShares,
          assetType: 'MARKET_OPTION',
          assetId: balance.assetId,
          fromAccountId: ammAccount.id,
          toAccountId: clearingAccount.id,
        } as const
      }),
      {
        amount: tax.gt(0) ? receivedShares.sub(tax) : receivedShares,
        assetType: 'CURRENCY',
        assetId: 'PRIMARY',
        fromAccountId: clearingAccount.id,
        toAccountId: accountId,
      }
    )

    if (tax.gt(0)) {
      entries.push({
        amount: tax,
        assetType: 'CURRENCY',
        assetId: 'PRIMARY',
        fromAccountId: clearingAccount.id,
        toAccountId: houseAccount.id,
      })
    }
  }

  return entries
}
