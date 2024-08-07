import db, { Market } from '@play-money/database'
import { ExtendedMarket } from '../components/MarketOverviewPage'

export function getMarket(params: { id: string; extended: true }): Promise<ExtendedMarket>
export function getMarket(params: { id: string; extended?: false }): Promise<Market>
export function getMarket(params: { id: string; extended?: boolean }): Promise<Market | ExtendedMarket>

export async function getMarket({
  id,
  extended,
}: {
  id: string
  extended?: boolean
}): Promise<Market | ExtendedMarket> {
  if (extended) {
    const market = await db.market.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
        options: true,
        marketResolution: {
          include: {
            resolution: true,
            resolvedBy: true,
          },
        },
      },
    })

    if (!market) {
      throw new Error('Market not found')
    }

    return market
  }

  const market = await db.market.findUnique({ where: { id } })

  if (!market) {
    throw new Error('Market not found')
  }

  return market
}
