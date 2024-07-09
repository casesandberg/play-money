import db, { Market } from '@play-money/database'
import { sanitizeUser } from '@play-money/users/lib/sanitizeUser'
import { ExtendedMarket } from '../components/MarketOverviewPage'

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

    return {
      ...market,
      user: sanitizeUser(market.user),
      options: market.options.map((option) => ({
        ...option,
        color: option.currencyCode === 'YES' ? '#3b82f6' : '#ec4899',
      })),
      marketResolution: market.marketResolution
        ? {
            ...market.marketResolution,
            resolvedBy: sanitizeUser(market.marketResolution.resolvedBy),
            resolution: {
              ...market.marketResolution.resolution,
              color: market.marketResolution.resolution.currencyCode === 'YES' ? '#3b82f6' : '#ec4899',
            },
          }
        : undefined,
    }
  }

  const market = await db.market.findUnique({ where: { id } })

  if (!market) {
    throw new Error('Market not found')
  }

  return market
}
