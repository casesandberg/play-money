import Decimal from 'decimal.js'
import db from '@play-money/database'
import { TransactionTypeType } from '@play-money/database/zod/inputTypeSchemas/TransactionTypeSchema'
import { calculateProbability } from '@play-money/finance/amms/maniswap-v1.1'
import { getMarket } from '@play-money/markets/lib/getMarket'
import { getMarketAmmAccount } from './getMarketAmmAccount'
import { MarketTransaction } from './getMarketTransactions'

type Bucket = {
  startAt: Date
  endAt: Date
  transactions: Array<MarketTransaction>
  options: Array<{
    id: string
    probability: Decimal
    shares: Decimal
  }>
}

export async function getMarketTransactionsTimeSeries({
  marketId,
  startAt,
  endAt = new Date(),
  tickInterval = 24, // in hours
  excludeTransactionTypes,
}: {
  marketId: string
  startAt?: Date
  endAt?: Date
  tickInterval?: number
  excludeTransactionTypes?: Array<TransactionTypeType>
}) {
  const market = await getMarket({ id: marketId, extended: true })
  const ammAccount = await getMarketAmmAccount({ marketId: marketId })

  if (!startAt) {
    startAt = market.createdAt
  }

  const tickIntervalMs = tickInterval * 60 * 60 * 1000
  const numBuckets = Math.ceil((endAt.getTime() - startAt.getTime()) / tickIntervalMs)

  const buckets = Array.from(
    { length: numBuckets },
    (_, i) =>
      ({
        startAt: new Date(startAt.getTime() + i * tickIntervalMs),
        endAt: new Date(startAt.getTime() + (i + 1) * tickIntervalMs),
        transactions: [],
        options: market.options.map((option) => ({
          shares: new Decimal(0),
          probability: new Decimal(0),
          id: option.id,
        })),
      }) as Bucket
  )

  const transactions = await db.transaction.findMany({
    where: {
      marketId: marketId,
      createdAt: {
        gte: startAt,
        lte: endAt,
      },
      type: {
        notIn: excludeTransactionTypes,
      },
    },
    include: {
      entries: true,
    },
  })

  transactions.forEach((transaction) => {
    const transactionTime = transaction.createdAt.getTime()
    const bucketIndex = Math.floor((transactionTime - startAt.getTime()) / tickIntervalMs)
    if (bucketIndex >= 0 && bucketIndex < numBuckets) {
      buckets[bucketIndex].transactions.push(transaction)
    }
  })

  buckets.forEach((bucket, i) => {
    // Start with the previous bucket's shares
    if (i > 0) {
      const lastBucket = buckets[i - 1]
      bucket.options = bucket.options.map((option) => {
        const lastBucketOption = lastBucket.options.find((o) => option.id === o.id)!
        return {
          ...option,
          shares: lastBucketOption.shares,
        }
      })
    }

    bucket.transactions.forEach((transaction) => {
      transaction.entries.forEach((item) => {
        const option = bucket.options.find((o) => o.id === item.assetId)

        if (!option) {
          return
        }

        if (item.toAccountId === ammAccount.id) {
          option.shares = option.shares.plus(item.amount)
        }
        if (item.fromAccountId === ammAccount.id) {
          option.shares = option.shares.minus(item.amount)
        }
      })
    })

    const totalShares = bucket.options.reduce((sum, option) => sum.plus(option.shares), new Decimal(0))

    bucket.options = bucket.options.map((option) => {
      return {
        ...option,
        probability: option.shares.eq(0)
          ? new Decimal(0)
          : calculateProbability({ targetShare: option.shares, totalShares }).times(100).round(),
      }
    })
  })

  const timeSeriesData = buckets.map((bucket) => ({
    startAt: bucket.startAt,
    endAt: bucket.endAt,
    options: bucket.options.map((option) => ({
      id: option.id,
      probability: option.probability.toNumber(),
    })),
  }))

  return timeSeriesData
}
