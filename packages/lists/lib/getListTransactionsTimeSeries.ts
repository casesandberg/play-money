import Decimal from 'decimal.js'
import db from '@play-money/database'
import { TransactionTypeType } from '@play-money/database/zod/inputTypeSchemas/TransactionTypeSchema'
import { calculateProbability } from '@play-money/finance/amms/maniswap-v1.1'
import { distributeRemainder } from '@play-money/finance/lib/helpers'
import { getList } from '@play-money/lists/lib/getList'
import { getMarketAmmAccount } from '@play-money/markets/lib/getMarketAmmAccount'
import { MarketTransaction } from '@play-money/markets/lib/getMarketTransactions'

type Bucket = {
  startAt: Date
  endAt: Date
  transactions: Array<MarketTransaction>
  markets: Array<{
    id: string
    probability: Decimal
    options: Array<{
      id: string
      probability: Decimal
      shares: Decimal
    }>
  }>
}

export async function getListTransactionsTimeSeries({
  listId,
  startAt,
  endAt = new Date(),
  tickInterval = 24, // in hours
  excludeTransactionTypes,
}: {
  listId: string
  startAt?: Date
  endAt?: Date
  tickInterval?: number
  excludeTransactionTypes?: Array<TransactionTypeType>
}) {
  const list = await getList({ id: listId, extended: true })

  // Get AMM accounts for all markets in the list
  const ammAccounts = await Promise.all(
    list.markets.map((market) => getMarketAmmAccount({ marketId: market.market.id }))
  )

  if (!startAt) {
    startAt = new Date(list.createdAt.getTime() - 60000) // Subtracting a minute to account for legacy list creation
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
        markets: list.markets.map((market) => ({
          options: market.market.options.map((option) => ({
            id: option.id,
            probability: new Decimal(0),
            shares: new Decimal(0),
          })),
          probability: new Decimal(0),
          id: market.market.id,
        })),
      }) as Bucket
  )

  // Get transactions for all markets in the list
  const transactions = await db.transaction.findMany({
    where: {
      marketId: {
        in: list.markets.map((market) => market.market.id),
      },
      createdAt: {
        gte: startAt,
        lte: endAt,
      },
      type: {
        notIn: excludeTransactionTypes,
      },
      isReverse: null,
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
      bucket.markets = bucket.markets.map((market) => {
        const lastBucketMarket = lastBucket.markets.find((m) => market.id === m.id)!

        return {
          ...market,
          options: market.options.map((option) => ({
            ...option,
            shares: lastBucketMarket.options.find((o) => o.id === option.id)!.shares,
          })),
        }
      })
    }

    bucket.transactions.forEach((transaction) => {
      transaction.entries.forEach(
        (item: { assetId: string; toAccountId: string; fromAccountId: string; amount: Decimal }) => {
          const market = bucket.markets.find((m) => m.id === transaction.marketId)
          const option = market?.options.find((o) => o.id === item.assetId)
          const ammAccount = ammAccounts.find((acc) => acc.marketId === transaction.marketId)

          if (!market || !option || !ammAccount) {
            return
          }

          if (item.toAccountId === ammAccount.id) {
            option.shares = option.shares.plus(item.amount)
          }
          if (item.fromAccountId === ammAccount.id) {
            option.shares = option.shares.minus(item.amount)
          }
        }
      )
    })

    bucket.markets = bucket.markets.map((market, i) => {
      const shares = market.options.map((option) => option.shares)
      const probabilities = market.options.map((_market, i) => {
        return calculateProbability({ index: i, shares })
      })
      const distributed = distributeRemainder(probabilities)

      return {
        ...market,
        probability: distributed[0],
        options: market.options.map((option, i) => ({
          ...option,
          probability: distributed[i],
        })),
      }
    })
  })

  const timeSeriesData = buckets.map((bucket) => ({
    startAt: bucket.startAt,
    endAt: bucket.endAt,
    markets: bucket.markets.map((market) => ({
      id: market.id,
      probability: market.probability.toNumber(),
    })),
  }))

  return timeSeriesData
}
