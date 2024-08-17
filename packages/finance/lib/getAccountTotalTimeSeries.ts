import { Decimal } from 'decimal.js'
import db, { TransactionItem } from '@play-money/database'

type Bucket = {
  startAt: Date
  endAt: Date
  transactionItems: Array<TransactionItem>
  totalAmount: Decimal
}

export async function getAccountTotalTimeSeries({
  accountId,
  startAt,
  endAt = new Date(),
  tickInterval = 24, // in hours
  excludeTransactionTypes,
}: {
  accountId: string
  startAt?: Date
  endAt?: Date
  tickInterval?: number
  excludeTransactionTypes?: string[]
}) {
  if (!startAt) {
    const firstTransactionItem = await db.transactionItem.findFirst({
      where: { accountId },
      orderBy: { createdAt: 'asc' },
    })
    startAt = firstTransactionItem?.createdAt || new Date()
  }

  const tickIntervalMs = tickInterval * 60 * 60 * 1000
  const numBuckets = Math.ceil((endAt.getTime() - startAt.getTime()) / tickIntervalMs)

  const buckets: Bucket[] = Array.from({ length: numBuckets }, (_, i) => ({
    startAt: new Date(startAt.getTime() + i * tickIntervalMs),
    endAt: new Date(startAt.getTime() + (i + 1) * tickIntervalMs),
    transactionItems: [],
    totalAmount: new Decimal(0),
  }))

  const transactionItems = await db.transactionItem.findMany({
    where: {
      accountId: accountId,
      createdAt: {
        gte: startAt,
        lte: endAt,
      },
      currencyCode: 'PRIMARY',
      transaction: {
        type: {
          notIn: excludeTransactionTypes,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  transactionItems.forEach((transactionItem) => {
    const transactionTime = transactionItem.createdAt.getTime()
    const bucketIndex = Math.floor((transactionTime - startAt.getTime()) / tickIntervalMs)
    if (bucketIndex >= 0 && bucketIndex < numBuckets) {
      buckets[bucketIndex].transactionItems.push(transactionItem)
    }
  })

  buckets.forEach((bucket, i) => {
    // Start with the previous bucket's totalAmount
    if (i > 0) {
      bucket.totalAmount = buckets[i - 1].totalAmount
    }

    bucket.transactionItems.forEach((transactionItem) => {
      bucket.totalAmount = bucket.totalAmount.plus(transactionItem.amount)
    })
  })

  const timeSeriesData = buckets.map((bucket) => ({
    startAt: bucket.startAt,
    endAt: bucket.endAt,
    totalAmount: bucket.totalAmount.toNumber(),
  }))

  return timeSeriesData
}
