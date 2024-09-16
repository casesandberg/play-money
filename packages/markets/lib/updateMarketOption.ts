import db, { MarketOption } from '@play-money/database'

export async function updateMarketOption({ id, name, color }: { id: string; name?: string; color?: string }) {
  const updatedData: Partial<MarketOption> = {}

  if (name) {
    updatedData.name = name
  }

  if (color) {
    updatedData.color = color
  }

  const updatedMarket = await db.marketOption.update({
    where: { id },
    data: { ...updatedData, updatedAt: new Date() },
  })

  return updatedMarket
}
