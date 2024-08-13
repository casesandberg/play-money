import Decimal from 'decimal.js'
import db from '@play-money/database'
import { getMarketQuote } from '@play-money/markets/lib/getMarketQuote'
import {
  hasPlacedMarketTradeToday,
  hasCreatedMarketToday,
  hasCommentedToday,
  hasBoostedLiquidityToday,
  calculateActiveDayCount,
} from '@play-money/quests/lib/helpers'

async function getMarketsCountByUser(userId: string) {
  const count = await db.market.count({
    where: {
      createdBy: userId,
    },
  })
  return count
}

async function getTradingVolumeByUser(userId: string) {
  const buyVolume = await db.transactionItem.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      account: {
        userId,
      },
      currencyCode: 'PRIMARY',
      transaction: {
        type: 'MARKET_BUY',
      },
    },
  })

  const sellVolume = await db.transactionItem.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      account: {
        userId,
      },
      currencyCode: 'PRIMARY',
      transaction: {
        type: 'MARKET_SELL',
      },
    },
  })

  const totalVolume = Decimal.abs(buyVolume._sum.amount || 0).plus(Decimal.abs(sellVolume._sum.amount || 0))

  return totalVolume
}

async function getNetWorthByUser(userId: string) {
  const netWorth = await db.transactionItem.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      account: {
        userId,
      },
      currencyCode: 'PRIMARY',
    },
  })

  return netWorth._sum.amount ?? new Decimal(0)
}

// NOTE: This is temporary as part of the financial re-write. Will be replaced with P&L statements.
async function getOtherIncomeByUser(userId: string) {
  const transactions = await db.transaction.findMany({
    where: {
      creator: {
        userId,
      },
      type: { in: ['MARKET_BUY', 'MARKET_SELL'] },
    },
    include: {
      transactionItems: true,
    },
  })

  const allPositions = transactions.reduce(
    (acc, transaction) => {
      if (!transaction.marketId) {
        return acc
      }

      const yesOptions = transaction.transactionItems.filter(
        (item) => item.currencyCode === 'YES' && item.accountId === transaction.creatorId
      )
      const yesOptionsSum = yesOptions.reduce((itemSum, item) => itemSum.plus(item.amount), new Decimal(0))

      const noOptions = transaction.transactionItems.filter(
        (item) => item.currencyCode === 'NO' && item.accountId === transaction.creatorId
      )
      const noOptionsSum = noOptions.reduce((itemSum, item) => itemSum.plus(item.amount), new Decimal(0))

      if (!acc[transaction.marketId] && (yesOptionsSum.greaterThan(0) || noOptionsSum.greaterThan(0))) {
        acc[transaction.marketId] = { YES: 0, NO: 0 }
      }

      if (yesOptionsSum.greaterThan(0)) {
        acc[transaction.marketId].YES = yesOptionsSum.plus(acc[transaction.marketId].YES).toNumber()
      }

      if (noOptionsSum.greaterThan(0)) {
        acc[transaction.marketId].NO = noOptionsSum.plus(acc[transaction.marketId].NO).toNumber()
      }

      return acc
    },
    {} as Record<string, { YES: number; NO: number }>
  )

  let totalValue = new Decimal(0)

  for (const [marketId, positions] of Object.entries(allPositions)) {
    const yesMarketOption = await db.marketOption.findFirst({
      where: { currencyCode: 'YES', marketId },
    })
    const noMarketOption = await db.marketOption.findFirst({
      where: { currencyCode: 'NO', marketId },
    })

    for (const [currencyCode, amount] of Object.entries(positions)) {
      if (amount > 0) {
        const { shares: quote } = await getMarketQuote({
          marketId,
          optionId: (currencyCode === 'YES' ? yesMarketOption?.id : noMarketOption?.id) || '',
          amount: new Decimal(amount),
          isBuy: false,
        })
        totalValue = totalValue.plus(quote)
      }
    }
  }

  return totalValue.toNumber()
}

async function getLastTradeByUser(userId: string) {
  const lastTrade = await db.transactionItem.findFirst({
    where: {
      account: {
        userId,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return lastTrade?.createdAt
}

export async function getUserStats({ userId }: { userId: string }) {
  const [
    netWorth,
    tradingVolume,
    totalMarkets,
    lastTradeAt,
    hasPlacedMarketTrade,
    hasCreatedMarket,
    hasCommented,
    hasBoostedLiquidity,
    activeDayCount,
    otherIncome,
  ] = await Promise.all([
    getNetWorthByUser(userId),
    getTradingVolumeByUser(userId),
    getMarketsCountByUser(userId),
    getLastTradeByUser(userId),
    hasPlacedMarketTradeToday({ userId }),
    hasCreatedMarketToday({ userId }),
    hasCommentedToday({ userId }),
    hasBoostedLiquidityToday({ userId }),
    calculateActiveDayCount({ userId }),
    getOtherIncomeByUser(userId),
  ])

  return {
    netWorth,
    tradingVolume,
    totalMarkets,
    lastTradeAt,
    hasPlacedMarketTrade,
    hasCreatedMarket,
    hasCommented,
    hasBoostedLiquidity,
    activeDayCount,
    otherIncome,
  }
}
