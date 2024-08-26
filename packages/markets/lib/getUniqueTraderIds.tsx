import db from '@play-money/database'

export async function getUniqueTraderIds(marketId: string, ignoreIds: string[] = []): Promise<string[]> {
  const result = await db.transaction.findMany({
    where: {
      type: {
        in: ['TRADE_BUY', 'TRADE_SELL'],
      },
      marketId,
    },
    select: {
      initiatorId: true,
    },
    distinct: ['initiatorId'],
  })

  const uniqueTraderIds = result
    .map((transaction) => transaction.initiatorId)
    .filter((userId): userId is string => userId != null && !ignoreIds.includes(userId))

  return uniqueTraderIds
}
