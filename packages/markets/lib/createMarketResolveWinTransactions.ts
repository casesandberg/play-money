import Decimal from 'decimal.js'
import db, { Transaction } from '@play-money/database'
import { executeTransaction } from '@play-money/finance/lib/executeTransaction'
import { getMarket } from './getMarket'
import { getMarketAmmAccount } from './getMarketAmmAccount'
import { getMarketClearingAccount } from './getMarketClearingAccount'
import { updateMarketBalances } from './updateMarketBalances'

export async function createMarketResolveWinTransactions({
  initiatorId,
  marketId,
  winningOptionId,
}: {
  initiatorId: string
  marketId: string
  winningOptionId: string
}) {
  const [ammAccount, clearingAccount, winningPositions, market] = await Promise.all([
    getMarketAmmAccount({ marketId }),
    getMarketClearingAccount({ marketId }),
    db.marketOptionPosition.findMany({
      where: {
        marketId,
        optionId: winningOptionId,
      },
    }),
    getMarket({ id: marketId, extended: true }),
  ])

  const summedWinningQuantities = winningPositions.reduce(
    (acc, position) => {
      if (!acc[position.accountId]) {
        acc[position.accountId] = new Decimal(0)
      }

      acc[position.accountId] = acc[position.accountId].add(position.quantity)

      return acc
    },
    {} as Record<string, Decimal>
  )

  const transactions: Array<Promise<Transaction>> = []

  // Transfer winning shares back to the AMM and convert to primary currency
  for (const [accountId, quantity] of Object.entries(summedWinningQuantities)) {
    const entries = [
      {
        fromAccountId: accountId,
        toAccountId: clearingAccount.id,
        assetType: 'MARKET_OPTION',
        assetId: winningOptionId,
        amount: quantity,
      } as const,
      ...(market.options || [])
        .filter(({ id }) => id !== winningOptionId)
        .map((option) => {
          return {
            fromAccountId: ammAccount.id,
            toAccountId: clearingAccount.id,
            assetType: 'MARKET_OPTION',
            assetId: option.id,
            amount: quantity,
          } as const
        }),
      {
        fromAccountId: clearingAccount.id,
        toAccountId: accountId,
        assetType: 'CURRENCY',
        assetId: 'PRIMARY',
        amount: quantity,
      } as const,
    ]

    transactions.push(
      executeTransaction({
        type: 'TRADE_WIN',
        entries,
        marketId,
        additionalLogic: async (txParams) => {
          await Promise.all(
            Object.entries(summedWinningQuantities).map(async ([accountId, quantity]) => {
              return txParams.tx.marketOptionPosition.update({
                where: {
                  accountId_optionId: {
                    accountId,
                    optionId: winningOptionId,
                  },
                },
                data: {
                  quantity: {
                    decrement: quantity.toNumber(),
                  },
                  value: 0,
                },
              })
            })
          )
          return updateMarketBalances({ ...txParams, marketId })
        },
      })
    )
  }

  return transactions
}
