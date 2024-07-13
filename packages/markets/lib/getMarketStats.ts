import Decimal from 'decimal.js'
import { getAmmAccount } from '@play-money/accounts/lib/getAmmAccount'
import { getExchangerAccount } from '@play-money/accounts/lib/getExchangerAccount'
import db from '@play-money/database'
import { getMarketLiquidity } from './getMarketLiquidity'

async function getMarketTraderBonusPayouts(marketId: string) {
  const ammAccount = await getAmmAccount({ marketId })
  const exchangerAccount = await getExchangerAccount()
  const systemAccountIds = [ammAccount.id, exchangerAccount.id]

  const netWorth = await db.transactionItem.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      accountId: { notIn: systemAccountIds },
      transaction: {
        type: 'MARKET_TRADER_BONUS',
        marketId,
      },
      currencyCode: 'PRIMARY',
    },
  })

  return netWorth._sum.amount ?? new Decimal(0)
}

async function getUserMarketTraderBonusPayouts(marketId: string, userId: string) {
  const netWorth = await db.transactionItem.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      account: {
        userId,
      },
      transaction: {
        type: 'MARKET_TRADER_BONUS',
        marketId,
      },
      currencyCode: 'PRIMARY',
    },
  })

  return netWorth._sum.amount ?? new Decimal(0)
}

export async function getMarketStats({ marketId, userId }: { marketId: string; userId?: string }) {
  const [liquidity, traderBonusPayouts, userHoldingsPayout] = await Promise.all([
    getMarketLiquidity(marketId),
    getMarketTraderBonusPayouts(marketId),
    userId ? getUserMarketTraderBonusPayouts(marketId, userId) : undefined,
  ])

  return {
    totalLiquidity: liquidity.total,
    lpUserCount: Object.keys(liquidity.providers).length,
    traderBonusPayouts: traderBonusPayouts,
    holdings: {
      traderBonusPayouts: userHoldingsPayout,
    },
  }
}
