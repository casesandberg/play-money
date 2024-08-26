import Decimal from 'decimal.js'
import db from '@play-money/database'
import {
  hasPlacedMarketTradeToday,
  hasCreatedMarketToday,
  hasCommentedToday,
  hasBoostedLiquidityToday,
  calculateActiveDayCount,
} from '@play-money/quests/lib/helpers'
import { getUserPrimaryAccount } from './getUserPrimaryAccount'

async function getMarketsCountByUser(userId: string) {
  const count = await db.market.count({
    where: {
      createdBy: userId,
    },
  })
  return count
}

async function getTradingVolumeByUser(userId: string) {
  const buyVolume = await db.transactionEntry.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      assetType: 'CURRENCY',
      assetId: 'PRIMARY',
      transaction: {
        type: 'TRADE_BUY',
        initiatorId: userId,
      },
    },
  })

  const sellVolume = await db.transactionEntry.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      assetType: 'CURRENCY',
      assetId: 'PRIMARY',
      transaction: {
        type: 'TRADE_SELL',
        initiatorId: userId,
      },
    },
  })

  const totalVolume = Decimal.abs(buyVolume._sum.amount || 0).plus(Decimal.abs(sellVolume._sum.amount || 0))

  return totalVolume
}

async function getNetWorthByUser(userId: string) {
  const userAccount = await getUserPrimaryAccount({ userId })
  const transactions = await db.transactionEntry.findMany({
    where: {
      assetType: 'CURRENCY',
      assetId: 'PRIMARY',
      OR: [{ fromAccountId: userAccount.id }, { toAccountId: userAccount.id }],
    },
    select: {
      amount: true,
      fromAccountId: true,
      toAccountId: true,
    },
  })

  const netWorth = transactions.reduce((sum, transaction) => {
    if (transaction.toAccountId === userAccount.id) {
      return sum.add(transaction.amount)
    } else if (transaction.fromAccountId === userAccount.id) {
      return sum.sub(transaction.amount)
    }
    return sum
  }, new Decimal(0))

  return netWorth
}

async function getOtherIncomeByUser(userId: string) {
  const userAccount = await getUserPrimaryAccount({ userId })

  const positions = await db.marketOptionPosition.aggregate({
    _sum: {
      value: true,
    },
    where: {
      accountId: userAccount.id,
    },
  })

  return positions._sum.value || new Decimal(0)
}

async function getLastTradeByUser(userId: string) {
  const lastTrade = await db.transaction.findFirst({
    where: {
      initiatorId: userId,
      type: {
        in: ['TRADE_BUY', 'TRADE_SELL'],
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
