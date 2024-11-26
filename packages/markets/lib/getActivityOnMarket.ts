import { addDays, isWithinInterval } from 'date-fns'
import db, { Transaction } from '@play-money/database'
import { TransactionWithEntries } from '@play-money/finance/types'
import { MarketActivity } from '../types'

type ActivityInput = {
  marketId: string
  cursor?: Date
  limit?: number
  granularityDays?: number
}

export async function getActivityOnMarket({
  marketId,
  cursor = new Date(),
  limit = 15,
  granularityDays = 1,
}: ActivityInput): Promise<Array<MarketActivity>> {
  const [comments, transactions, market] = await Promise.all([
    db.comment.findMany({
      where: {
        entityType: 'MARKET',
        entityId: marketId,
        createdAt: { lt: cursor },
      },
      include: {
        author: true,
        reactions: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),

    db.transaction.findMany({
      where: {
        marketId,
        createdAt: { lt: cursor },
        type: {
          in: ['TRADE_BUY', 'TRADE_SELL', 'LIQUIDITY_DEPOSIT', 'LIQUIDITY_WITHDRAWAL'],
        },
        initiatorId: {
          not: null,
        },
        isReverse: null,
      },
      include: {
        entries: true,
        market: true,
        initiator: true,
        options: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),

    db.market.findUnique({
      where: { id: marketId },
      include: {
        user: true,
        marketResolution: {
          include: {
            resolution: true,
            resolvedBy: true,
            market: true,
          },
        },
      },
    }),
  ])

  const nonGroupedActivities: Array<MarketActivity> = []

  if (market) {
    nonGroupedActivities.push({
      type: 'MARKET_CREATED',
      timestampAt: market.createdAt,
      market: market,
    })
  }

  if (market?.marketResolution) {
    nonGroupedActivities.push({
      type: 'MARKET_RESOLVED',
      timestampAt: market.marketResolution.createdAt,
      marketResolution: market.marketResolution,
    })
  }

  if (market?.canceledAt) {
    nonGroupedActivities.push({
      type: 'MARKET_CANCELED',
      timestampAt: market.canceledAt,
      market: market,
    })
  }

  nonGroupedActivities.push(
    ...comments.map((comment) => ({
      type: 'COMMENT' as const,
      timestampAt: comment.createdAt,
      comment: comment,
    }))
  )

  const initialGroups = groupTransactionsByType(transactions, granularityDays)

  // Split groups based on other activities
  const finalActivities = mergeAndSplitActivities(initialGroups, nonGroupedActivities, granularityDays)

  // Sort all activities by timestamp descending
  finalActivities.sort((a, b) => b.timestampAt.getTime() - a.timestampAt.getTime())

  // Apply limit
  return finalActivities.slice(0, limit)
}

function groupTransactionsByType(
  transactions: Array<TransactionWithEntries>,
  granularityDays: number
): Array<MarketActivity> {
  const sortedTransactions = [...transactions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  const buckets: Record<string, Array<TransactionWithEntries>> = {}

  for (const transaction of sortedTransactions) {
    const transactionType = transactionToActivityType(transaction)
    const option = transaction.options?.[0]

    // Try to find an existing bucket within granularity period
    let foundBucket = false
    for (const [existingKey, existingTransactions] of Object.entries(buckets)) {
      const existingTime = existingTransactions[0].createdAt

      const isWithinGranularity = isWithinInterval(transaction.createdAt, {
        start: addDays(existingTime, -granularityDays),
        end: addDays(existingTime, granularityDays),
      })

      const isSameType = transactionToActivityType(existingTransactions[0]) === transactionType
      const isSameOption = (existingTransactions[0].options?.[0]?.id || 'none') === (option?.id || 'none')

      if (isWithinGranularity && isSameType && isSameOption) {
        buckets[existingKey].push(transaction)
        foundBucket = true
        break
      }
    }

    if (!foundBucket) {
      // Create new bucket if no matching bucket found
      const newKey = `${transaction.createdAt.getTime()}_${transactionType}_${option?.id || 'none'}`
      buckets[newKey] = [transaction]
    }
  }

  // Convert buckets to activities
  return Object.values(buckets).map((bucketTransactions) => ({
    transactions: bucketTransactions,
    timestampAt: bucketTransactions[0].createdAt,
    type: transactionToActivityType(bucketTransactions[0]),
    option: bucketTransactions[0].options?.[0],
  }))
}

function mergeAndSplitActivities(
  transactionGroups: Array<MarketActivity>,
  nonGroupedActivities: Array<MarketActivity>,
  granularityDays: number
): Array<MarketActivity> {
  const allActivities: Array<MarketActivity> = [...nonGroupedActivities]
  const timePoints = [...nonGroupedActivities].sort((a, b) => b.timestampAt.getTime() - a.timestampAt.getTime())

  for (const group of transactionGroups) {
    const subgroups = splitTransactionGroup(group, timePoints, granularityDays)

    allActivities.push(...subgroups)
  }

  return allActivities
}

function splitTransactionGroup(
  group: MarketActivity,
  timePoints: Array<MarketActivity>,
  granularityDays: number
): Array<MarketActivity> {
  const result: Array<MarketActivity> = []
  let currentTransactions: any[] = []
  let currentTimestamp = group.transactions![0].createdAt

  for (const transaction of group.transactions!) {
    // Check if any timePoint falls between the current timestamp and this transaction
    const splitPoint = timePoints.find(
      (point) =>
        point.timestampAt.getTime() > transaction.createdAt.getTime() &&
        point.timestampAt.getTime() < currentTimestamp.getTime() &&
        isWithinInterval(point.timestampAt, {
          start: addDays(currentTimestamp, -granularityDays),
          end: addDays(currentTimestamp, granularityDays),
        })
    )

    if (splitPoint && currentTransactions.length > 0) {
      // Create a new group with accumulated transactions
      result.push({
        transactions: currentTransactions,
        timestampAt: currentTimestamp,
        type: group.type,
        option: group.transactions![0].options?.[0],
      })
      // Start a new group
      currentTransactions = [transaction]
      currentTimestamp = transaction.createdAt
    } else {
      currentTransactions.push(transaction)
    }
  }

  // Add the final group
  if (currentTransactions.length > 0) {
    result.push({
      transactions: currentTransactions,
      timestampAt: currentTimestamp,
      type: group.type,
      option: group.transactions![0].options?.[0],
    })
  }

  return result
}

function transactionToActivityType(transaction: Transaction): 'TRADE_TRANSACTION' | 'LIQUIDITY_TRANSACTION' {
  if (transaction.type === 'TRADE_BUY' || transaction.type === 'TRADE_SELL') {
    return 'TRADE_TRANSACTION'
  } else if (transaction.type === 'LIQUIDITY_DEPOSIT' || transaction.type === 'LIQUIDITY_WITHDRAWAL') {
    return 'LIQUIDITY_TRANSACTION'
  } else {
    throw new Error('Invalid transaction type')
  }
}
