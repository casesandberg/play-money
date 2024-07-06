import Decimal from 'decimal.js'
import db from '@play-money/database'

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
  const [netWorth, tradingVolume, totalMarkets, lastTradeAt] = await Promise.all([
    getNetWorthByUser(userId),
    getTradingVolumeByUser(userId),
    getMarketsCountByUser(userId),
    getLastTradeByUser(userId),
  ])

  return {
    netWorth,
    tradingVolume,
    totalMarkets,
    lastTradeAt,
  }
}
