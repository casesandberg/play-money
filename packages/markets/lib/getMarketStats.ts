import Decimal from 'decimal.js'
import { getExchangerAccount } from '@play-money/accounts/lib/getExchangerAccount'
import db from '@play-money/database'

async function getMarketLiquidity(marketId: string) {
  const exchangerAccount = await getExchangerAccount()

  const liquidity = await db.transactionItem.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      transaction: {
        type: 'MARKET_LIQUIDITY',
        marketId,
      },
      accountId: exchangerAccount.id,
      currencyCode: 'PRIMARY',
    },
  })

  return liquidity._sum.amount ?? new Decimal(0)
}

async function getMarketLPCount(marketId: string) {
  const result = await db.transaction.findMany({
    where: {
      type: 'MARKET_LIQUIDITY',
      marketId,
    },
    distinct: ['creatorId'],
  })

  return result.length
}

export async function getMarketStats({ marketId }: { marketId: string }) {
  const [totalLiquidity, lpUserCount] = await Promise.all([getMarketLiquidity(marketId), getMarketLPCount(marketId)])

  return {
    totalLiquidity,
    lpUserCount,
    traderBonusPayouts: new Decimal(0),
  }
}
