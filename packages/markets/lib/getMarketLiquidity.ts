import { Decimal } from 'decimal.js'
import db from '@play-money/database'

export async function getMarketLiquidity(
  marketId: string
): Promise<{ total: Decimal; providers: { [accountId: string]: Decimal } }> {
  const result =
    (await db.transaction.findMany({
      where: {
        type: 'MARKET_LIQUIDITY',
        marketId,
      },
      select: {
        creatorId: true,
        transactionItems: {
          where: {
            currencyCode: 'PRIMARY',
          },
          select: {
            amount: true,
            accountId: true,
          },
        },
      },
    })) ?? []

  const providers: { [accountId: string]: Decimal } = {}
  let total = new Decimal(0)

  result.forEach((transaction) => {
    const creatorId = transaction.creatorId
    const transactionTotal = transaction.transactionItems
      .filter((item) => item.accountId === creatorId)
      .reduce((sum, item) => sum.plus(item.amount.abs() ?? 0), new Decimal(0))

    if (providers[creatorId]) {
      providers[creatorId] = providers[creatorId].plus(transactionTotal)
    } else {
      providers[creatorId] = transactionTotal
    }

    total = total.plus(transactionTotal)
  })

  return { total, providers }
}
