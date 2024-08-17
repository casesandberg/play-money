import db from '@play-money/database'

export async function getUniqueLiquidityProviderIds(
  marketId: string,
  ignoreIds: Array<string | undefined> = []
): Promise<string[]> {
  const result = await db.transaction.findMany({
    where: {
      type: 'MARKET_LIQUIDITY',
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

  const uniqueProviderIds = result
    .map((transaction) => transaction.creator?.userId)
    .filter((userId): userId is string => userId != null && !ignoreIds.includes(userId))

  return uniqueProviderIds
}
