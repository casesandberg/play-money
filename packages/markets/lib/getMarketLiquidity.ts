import { Decimal } from 'decimal.js'
import db from '@play-money/database'
import { calculateBalanceChanges } from '@play-money/finance/lib/helpers'
import { getMarketAmmAccount } from './getMarketAmmAccount'
import { getMarketClearingAccount } from './getMarketClearingAccount'

export async function getMarketLiquidity(
  marketId: string
): Promise<{ total: Decimal; providers: { [accountId: string]: Decimal } }> {
  const [ammAccount, clearingAccount, result] = await Promise.all([
    getMarketAmmAccount({ marketId }),
    getMarketClearingAccount({ marketId }),
    await db.transaction.findMany({
      where: {
        marketId,
        type: {
          in: ['LIQUIDITY_DEPOSIT', 'LIQUIDITY_WITHDRAWAL'],
        },
      },
      select: {
        type: true,
        entries: {
          where: {
            assetType: 'CURRENCY',
          },
        },
      },
    }),
  ])

  const providers: { [accountId: string]: Decimal } = {}
  let total = new Decimal(0)

  await Promise.all(
    (result || []).map(async (transaction) => {
      const isDeposit = transaction.type === 'LIQUIDITY_DEPOSIT'
      const balanceChanges = await calculateBalanceChanges({ entries: transaction.entries })

      balanceChanges.map(async ({ accountId, change }) => {
        if ([ammAccount.id, clearingAccount.id].includes(accountId)) {
          return
        }

        if (!providers[accountId]) {
          providers[accountId] = new Decimal(0)
        }

        const oppositeChange = isDeposit ? new Decimal(change).abs() : new Decimal(change).neg()
        providers[accountId] = providers[accountId].plus(oppositeChange)
        total = total.plus(oppositeChange)
      })
    })
  )

  // Remove providers with zero balance
  Object.keys(providers).forEach((key) => {
    if (providers[key].toDecimalPlaces(4).isZero()) {
      delete providers[key]
    }
  })

  return { total, providers }
}
