import db from '@play-money/database'

export async function getUniqueTraderIds(marketId: string, ignoreIds: string[] = []): Promise<string[]> {
  const result = await db.transaction.findMany({
    where: {
      type: {
        in: ['MARKET_BUY', 'MARKET_SELL'],
      },
      marketId,
    },
    select: {
      creatorId: true,
      creator: {
        select: {
          userId: true,
        },
      },
    },
    distinct: ['creatorId'],
  })

  const uniqueTraderIds = result
    .map((transaction) => transaction.creator?.userId)
    .filter((userId): userId is string => userId != null && !ignoreIds.includes(userId))

  return uniqueTraderIds
}
