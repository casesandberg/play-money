import React from 'react'
import { getExtendedMarket } from '@play-money/api-helpers/client'
import { MarketComments } from '@play-money/markets/components/MarketComments'
import { MarketCommentsPage } from '@play-money/markets/components/MarketCommentsPage'

export default async function AppPostsSlugPage({ params }: { params: { marketId: string } }) {
  const { data: market } = await getExtendedMarket({ marketId: params.marketId })

  return <MarketCommentsPage market={market} renderComments={<MarketComments marketId={market.id} />} />
}
