import db, { _MarketModel } from '@play-money/database'
import { z } from 'zod'

export async function createMarket(marketData: z.infer<typeof _MarketModel>) {
  const createdMarket = await db.market.create({
    data: marketData,
  })

  return createdMarket
}
