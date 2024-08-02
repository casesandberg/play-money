import { startOfDay, endOfDay } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'
import db from '@play-money/database'
import { getUserById } from '@play-money/users/lib/getUserById'

export async function hasPlacedMarketTradeToday({ userId }: { userId: string }) {
  const { timezone } = await getUserById({ id: userId })

  const now = new Date()
  const startOfDayInUserTZ = fromZonedTime(startOfDay(toZonedTime(now, timezone)), timezone)
  const endOfDayInUserTZ = fromZonedTime(endOfDay(toZonedTime(now, timezone)), timezone)

  const transaction = await db.transaction.findFirst({
    where: {
      creator: {
        userId,
      },
      type: 'DAILY_TRADE_BONUS',
      createdAt: {
        gte: startOfDayInUserTZ,
        lte: endOfDayInUserTZ,
      },
    },
  })

  return !!transaction
}

export async function hasCreatedMarketToday({ userId }: { userId: string }) {
  const { timezone } = await getUserById({ id: userId })

  const now = new Date()
  const startOfDayInUserTZ = fromZonedTime(startOfDay(toZonedTime(now, timezone)), timezone)
  const endOfDayInUserTZ = fromZonedTime(endOfDay(toZonedTime(now, timezone)), timezone)

  const transaction = await db.transaction.findFirst({
    where: {
      creator: {
        userId,
      },
      type: 'DAILY_MARKET_BONUS',
      createdAt: {
        gte: startOfDayInUserTZ,
        lte: endOfDayInUserTZ,
      },
    },
  })

  return !!transaction
}

export async function hasCommentedToday({ userId }: { userId: string }) {
  const { timezone } = await getUserById({ id: userId })

  const now = new Date()
  const startOfDayInUserTZ = fromZonedTime(startOfDay(toZonedTime(now, timezone)), timezone)
  const endOfDayInUserTZ = fromZonedTime(endOfDay(toZonedTime(now, timezone)), timezone)

  const transaction = await db.transaction.findFirst({
    where: {
      creator: {
        userId,
      },
      type: 'DAILY_COMMENT_BONUS',
      createdAt: {
        gte: startOfDayInUserTZ,
        lte: endOfDayInUserTZ,
      },
    },
  })

  return !!transaction
}

export async function hasBoostedLiquidityToday({ userId }: { userId: string }) {
  const { timezone } = await getUserById({ id: userId })

  const now = new Date()
  const startOfDayInUserTZ = fromZonedTime(startOfDay(toZonedTime(now, timezone)), timezone)
  const endOfDayInUserTZ = fromZonedTime(endOfDay(toZonedTime(now, timezone)), timezone)

  const transaction = await db.transaction.findFirst({
    where: {
      creator: {
        userId,
      },
      type: 'DAILY_LIQUIDITY_BONUS',
      createdAt: {
        gte: startOfDayInUserTZ,
        lte: endOfDayInUserTZ,
      },
    },
  })

  return !!transaction
}
