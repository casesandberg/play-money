import Decimal from 'decimal.js'
import { get } from 'lodash'
import { z } from 'zod'
import { getAmmAccount } from '@play-money/accounts/lib/getAmmAccount'
import { getMarket } from '@play-money/markets/lib/getMarket'
import { MarketTransaction } from './getMarketTransactions'

type Bucket = {
  startAt: Date
  endAt: Date
  transactions: Array<MarketTransaction>
  yShares: Decimal
  nShares: Decimal
  probability: number
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
  excludeTransactionTypes?: string[]
}) {
  const market = await getMarket({ id: marketId })
  const ammAccount = await getAmmAccount({ marketId: marketId })

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
        yShares: new Decimal(0),
        nShares: new Decimal(0),
        probability: 0,
      }) as Bucket
  )

  const transactions = await prisma.transaction.findMany({
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
      transactionItems: true,
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
      bucket.yShares = buckets[i - 1].yShares
      bucket.nShares = buckets[i - 1].nShares
    }

    bucket.transactions.forEach((transaction) => {
      transaction.transactionItems.forEach((item) => {
        if (item.accountId === ammAccount.id) {
          if (item.currencyCode === 'YES') {
            bucket.yShares = bucket.yShares.plus(item.amount)
          } else if (item.currencyCode === 'NO') {
            bucket.nShares = bucket.nShares.plus(item.amount)
          }
        }
      })
    })

    const totalShares = bucket.yShares.plus(bucket.nShares)
    bucket.probability = totalShares.isZero() ? 0 : bucket.nShares.div(totalShares).toNumber()
  })

  const timeSeriesData = buckets.map((bucket) => ({
    startAt: bucket.startAt,
    endAt: bucket.endAt,
    probability: bucket.probability,
  }))

  return timeSeriesData
}
