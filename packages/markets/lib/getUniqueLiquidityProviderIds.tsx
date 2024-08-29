import db from '@play-money/database'

export async function getUniqueLiquidityProviderIds(
  marketId: string,
  ignoreIds: Array<string | undefined> = []
): Promise<string[]> {
  const result = await db.transaction.findMany({
    where: {
      type: 'LIQUIDITY_DEPOSIT',
      marketId,
    },
    select: {
      initiatorId: true,
    },
    distinct: ['initiatorId'],
  })

  const uniqueProviderIds = result
    .map((transaction) => transaction.initiatorId)
    .filter((userId): userId is string => userId != null && !ignoreIds.includes(userId))

  return uniqueProviderIds
}
