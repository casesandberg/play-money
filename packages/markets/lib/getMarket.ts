import db from '@play-money/database'

export async function getMarket({ id }: { id: string }) {
  const market = await db.market.findUnique({ where: { id } })

  if (!market) {
    throw new Error('Market not found')
  }

  return market
}
