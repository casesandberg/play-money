import { Decimal } from 'decimal.js'
import db from '@play-money/database'

type Bucket = {
  startAt: Date
  endAt: Date
  dau: number
  signups: number
  referrals: number
}

export async function getStatsUsersTimeSeries({
  startAt,
  endAt = new Date(),
  tickInterval = 24, // in hours
}: {
  startAt?: Date
  endAt?: Date
  tickInterval?: number
}) {
  if (!startAt) {
    const firstUser = await db.user.findFirst({
      orderBy: { createdAt: 'asc' },
    })
    startAt = firstUser?.createdAt || new Date()
  }

  const tickIntervalMs = tickInterval * 60 * 60 * 1000
  const numBuckets = Math.ceil((endAt.getTime() - startAt.getTime()) / tickIntervalMs)

  const buckets: Bucket[] = Array.from({ length: numBuckets }, (_, i) => ({
    startAt: new Date(startAt.getTime() + i * tickIntervalMs),
    endAt: new Date(startAt.getTime() + (i + 1) * tickIntervalMs),
    dau: 0,
    signups: 0,
    referrals: 0,
  }))

  return Promise.all(
    buckets.map(async (bucket) => {
      const dau = await db.transaction.groupBy({
        by: ['initiatorId'],
        where: {
          type: {
            in: ['DAILY_COMMENT_BONUS', 'DAILY_LIQUIDITY_BONUS', 'DAILY_MARKET_BONUS', 'DAILY_TRADE_BONUS'],
          },
          createdAt: {
            gt: bucket.startAt,
            lte: bucket.endAt,
          },
        },
      })

      const signups = await db.user.count({
        where: {
          createdAt: {
            gt: bucket.startAt,
            lte: bucket.endAt,
          },
        },
      })

      const referrals = await db.user.count({
        where: {
          createdAt: {
            gt: bucket.startAt,
            lte: bucket.endAt,
          },
          referredBy: {
            not: null,
          },
        },
      })

      return {
        ...bucket,
        dau: dau.length,
        signups,
        referrals,
      }
    })
  )
}
