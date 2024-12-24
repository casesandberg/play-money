import React from 'react'
import { getExtendedMarket, getMarketPositions } from '@play-money/api-helpers/client'
import { MarketPositionsPage } from '@play-money/markets/components/MarketPositionsPage'

export default async function AppPostsSlugPage({ params }: { params: { marketId: string } }) {
  const market = await getExtendedMarket({ marketId: params.marketId })
  const { data: marketPositions } = await getMarketPositions({
    marketId: params.marketId,
    status: 'active',
    limit: 100,
  })

  return <MarketPositionsPage market={market} positions={marketPositions} />
}
