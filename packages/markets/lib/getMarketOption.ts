import db from '@play-money/database'

export async function getMarketOption({ id, marketId }: { id: string; marketId?: string }) {
  const marketOption = await db.marketOption.findUnique({ where: { id, marketId } })

  if (!marketOption) {
    throw new Error('Market option not found')
  }

  return marketOption
}
