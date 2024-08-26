import { Decimal } from 'decimal.js'
import db, { TransactionEntry } from '@play-money/database'
import { TransactionTypeType } from '@play-money/database/zod/inputTypeSchemas/TransactionTypeSchema'

type Bucket = {
  startAt: Date
  endAt: Date
  transactionEntries: Array<TransactionEntry>
  balance: Decimal
}

export async function getUserTotalTimeSeries({
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
  excludeTransactionTypes?: Array<TransactionTypeType>
}) {
  if (!startAt) {
    const firstTransactionItem = await db.transactionEntry.findFirst({
      where: {
        OR: [
          {
            fromAccountId: accountId,
          },
          {
            toAccountId: accountId,
          },
        ],
      },
      orderBy: { createdAt: 'asc' },
    })
    startAt = firstTransactionItem?.createdAt || new Date()
  }

  const tickIntervalMs = tickInterval * 60 * 60 * 1000
  const numBuckets = Math.ceil((endAt.getTime() - startAt.getTime()) / tickIntervalMs)

  const buckets: Bucket[] = Array.from({ length: numBuckets }, (_, i) => ({
    startAt: new Date(startAt.getTime() + i * tickIntervalMs),
    endAt: new Date(startAt.getTime() + (i + 1) * tickIntervalMs),
    transactionEntries: [],
    balance: new Decimal(0),
  }))

  const transactionEntries = await db.transactionEntry.findMany({
    where: {
      OR: [
        {
          fromAccountId: accountId,
        },
        {
          toAccountId: accountId,
        },
      ],
      createdAt: {
        gte: startAt,
        lte: endAt,
      },
      assetType: 'CURRENCY',
      assetId: 'PRIMARY',
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

  transactionEntries.forEach((entry) => {
    const transactionTime = entry.createdAt.getTime()
    const bucketIndex = Math.floor((transactionTime - startAt.getTime()) / tickIntervalMs)
    if (bucketIndex >= 0 && bucketIndex < numBuckets) {
      buckets[bucketIndex].transactionEntries.push(entry)
    }
  })

  buckets.forEach((bucket, i) => {
    // Start with the previous bucket's balance
    if (i > 0) {
      bucket.balance = buckets[i - 1].balance
    }

    bucket.transactionEntries.forEach((entry) => {
      if (entry.fromAccountId === accountId) {
        bucket.balance = bucket.balance.sub(entry.amount)
      } else if (entry.toAccountId === accountId) {
        bucket.balance = bucket.balance.add(entry.amount)
      }
    })
  })

  const timeSeriesData = buckets.map((bucket) => ({
    startAt: bucket.startAt,
    endAt: bucket.endAt,
    balance: bucket.balance.toNumber(),
  }))

  return timeSeriesData
}
