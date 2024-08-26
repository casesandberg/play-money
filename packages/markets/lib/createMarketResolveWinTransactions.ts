import Decimal from 'decimal.js'
import db, { Transaction } from '@play-money/database'
import { REALIZED_GAINS_TAX } from '@play-money/finance/economy'
import { executeTransaction } from '@play-money/finance/lib/executeTransaction'
import { getHouseAccount } from '@play-money/finance/lib/getHouseAccount'
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
  const [ammAccount, clearingAccount, winningPositions, market, houseAccount] = await Promise.all([
    getMarketAmmAccount({ marketId }),
    getMarketClearingAccount({ marketId }),
    db.marketOptionPosition.findMany({
      where: {
        marketId,
        optionId: winningOptionId,
      },
    }),
    getMarket({ id: marketId, extended: true }),
    getHouseAccount(),
  ])

  const transactions: Array<Promise<Transaction>> = []

  // Transfer winning shares back to the AMM and convert to primary currency
  for (const position of winningPositions) {
    const taxedValue = position.quantity.sub(position.quantity.times(REALIZED_GAINS_TAX))
    const valueTaxedIfGains = taxedValue.gt(position.cost) ? taxedValue : position.quantity

    const amountTaxed = position.quantity.sub(valueTaxedIfGains)
    const isTaxed = amountTaxed.toDecimalPlaces(4).gt(0)

    const entries = [
      {
        fromAccountId: position.accountId,
        toAccountId: clearingAccount.id,
        assetType: 'MARKET_OPTION',
        assetId: winningOptionId,
        amount: position.quantity,
      } as const,
      ...(market.options || [])
        .filter(({ id }) => id !== winningOptionId)
        .map((option) => {
          return {
            fromAccountId: ammAccount.id,
            toAccountId: clearingAccount.id,
            assetType: 'MARKET_OPTION',
            assetId: option.id,
            amount: position.quantity,
          } as const
        }),
      {
        fromAccountId: clearingAccount.id,
        toAccountId: position.accountId,
        assetType: 'CURRENCY',
        assetId: 'PRIMARY',
        amount: isTaxed ? valueTaxedIfGains : position.quantity,
      } as const,
    ]

    if (isTaxed) {
      entries.push({
        amount: amountTaxed,
        assetType: 'CURRENCY',
        assetId: 'PRIMARY',
        fromAccountId: clearingAccount.id,
        toAccountId: houseAccount.id,
      })
    }

    transactions.push(
      executeTransaction({
        type: 'TRADE_WIN',
        entries,
        marketId,
        additionalLogic: async (txParams) => {
          return Promise.all([
            txParams.tx.marketOptionPosition.update({
              where: {
                id: position.id,
              },
              data: {
                quantity: {
                  decrement: position.quantity.toNumber(),
                },
                value: 0,
              },
            }),
            updateMarketBalances({ ...txParams, marketId }),
          ])
        },
      })
    )
  }

  return Promise.all([...transactions])
}
