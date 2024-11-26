import db from '@play-money/database'

export async function getUniqueLiquidityProviderIds(
  marketId: string,
  ignoreIds: Array<string | undefined> = []
): Promise<string[]> {
  const result = await db.transaction.findMany({
    where: {
      type: {
        in: ['LIQUIDITY_DEPOSIT', 'LIQUIDITY_INITIALIZE'],
      },
      marketId,
      isReverse: null,
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
