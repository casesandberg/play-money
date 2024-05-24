import { MarketComments } from '@play-money/comments/components/MarketComments'
import db from '@play-money/database'
import { MarketOverviewPage } from '@play-money/markets/components/MarketOverviewPage'

// TODO: @casesandberg Extract to API call
export const getMarket = async ({ id }: { id: string }) => {
  const market = await db.market.findUnique({
    where: {
      id,
    },
  })

  if (!market) {
    throw new Error('Market not found')
  }

  return {
    ...market,
    options: [
      {
        id: '1',
        name: 'Yes',
        probability: 0.72,
        volume: 1000,
        color: '#3b82f6',
      },
      {
        id: '2',
        name: 'No',
        probability: 0.28,
        volume: 1000,
        color: '#ec4899',
      },
    ],
  }
}

export default async function AppPostsSlugPage({ params }: { params: { marketId: string } }) {
  const market = await getMarket({ id: params.marketId })

  return <MarketOverviewPage market={market} renderComments={<MarketComments marketId={market.id} />} />
}
