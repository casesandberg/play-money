import { MarketComments } from '@play-money/comments/components/MarketComments'
import db from '@play-money/database'
import type { ExtendedMarket } from '@play-money/markets/components/MarketOverviewPage'
import { MarketOverviewPage } from '@play-money/markets/components/MarketOverviewPage'
import { sanitizeUser } from '@play-money/users/lib/sanitizeUser'

// TODO: @casesandberg Extract to API call
export const getMarket = async ({ id }: { id: string }): Promise<ExtendedMarket> => {
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

export default async function AppPostsSlugPage({ params }: { params: { marketId: string } }) {
  const market = await getMarket({ id: params.marketId })

  return <MarketOverviewPage market={market} renderComments={<MarketComments marketId={market.id} />} />
}
