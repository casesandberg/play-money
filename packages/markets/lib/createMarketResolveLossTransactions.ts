import Decimal from 'decimal.js'
import db, { Transaction } from '@play-money/database'
import { executeTransaction } from '@play-money/finance/lib/executeTransaction'
import { getMarketAmmAccount } from './getMarketAmmAccount'
import { updateMarketBalances } from './updateMarketBalances'

export async function createMarketResolveLossTransactions({
  marketId,
  initiatorId,
  winningOptionId,
}: {
  marketId: string
  initiatorId: string
  winningOptionId: string
}) {
  const [ammAccount, losingPositions] = await Promise.all([
    getMarketAmmAccount({ marketId }),
    db.marketOptionPosition.findMany({
      where: {
        marketId,
        option: {
          id: {
            not: winningOptionId,
          },
        },
      },
    }),
  ])

  const summedLosingQuantities = losingPositions.reduce(
    (acc, position) => {
      if (!acc[position.accountId]) {
        acc[position.accountId] = {}
      }

      if (!acc[position.accountId][position.optionId]) {
        acc[position.accountId][position.optionId] = new Decimal(0)
      }

      acc[position.accountId][position.optionId] = acc[position.accountId][position.optionId].add(position.quantity)

      return acc
    },
    {} as Record<string, Record<string, Decimal>>
  )

  const transactions: Array<Promise<Transaction>> = []

  // Transfer all losing shares back to the AMM
  for (const [accountId, optionQuantity] of Object.entries(summedLosingQuantities)) {
    const entries = []

    for (const [optionId, quantity] of Object.entries(optionQuantity)) {
      if (quantity.toDecimalPlaces(0).gt(0)) {
        entries.push({
          fromAccountId: accountId,
          toAccountId: ammAccount.id,
          assetType: 'MARKET_OPTION',
          assetId: optionId,
          amount: quantity,
        } as const)
      }
    }

    entries.length &&
      transactions.push(
        executeTransaction({
          type: 'TRADE_LOSS',
          entries,
          marketId,
          additionalLogic: async (txParams) => {
            await Promise.all(
              Object.entries(summedLosingQuantities).map(async ([accountId, optionQuantities]) => {
                return Promise.all(
                  Object.entries(optionQuantities).map(async ([optionId, quantity]) => {
                    return txParams.tx.marketOptionPosition.update({
                      where: {
                        accountId_optionId: {
                          accountId,
                          optionId,
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
              })
            )
            return updateMarketBalances({ ...txParams, marketId })
          },
        })
      )
  }

  return Promise.all(transactions)
}
