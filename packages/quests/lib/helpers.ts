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
      initiatorId: userId,
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
      initiatorId: userId,
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
      initiatorId: userId,
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
      initiatorId: userId,
      type: 'DAILY_LIQUIDITY_BONUS',
      createdAt: {
        gte: startOfDayInUserTZ,
        lte: endOfDayInUserTZ,
      },
    },
  })

  return !!transaction
}

export async function calculateActiveDayCount({ userId }: { userId: string }): Promise<number> {
  const { timezone } = await getUserById({ id: userId })

  const result = await db.$queryRaw<[{ activeDayCount: number }]>`
  SELECT COUNT(DISTINCT ("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${timezone})::date) AS "activeDayCount"
  FROM "Transaction"
  WHERE "initiatorId" = ${userId}
    AND "type" IN ('DAILY_LIQUIDITY_BONUS', 'DAILY_TRADE_BONUS', 'DAILY_COMMENT_BONUS', 'DAILY_MARKET_BONUS')
`

  return Number(result[0]?.activeDayCount ?? 0)
}
