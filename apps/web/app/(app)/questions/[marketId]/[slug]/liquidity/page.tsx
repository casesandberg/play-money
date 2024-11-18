import React from 'react'
import { getExtendedMarket, getMarketLiquidityTransactions } from '@play-money/api-helpers/client'
import { MarketLiquidityPage } from '@play-money/markets/components/MarketLiquidityPage'

export default async function AppPostsSlugPage({ params }: { params: { marketId: string } }) {
  const market = await getExtendedMarket({ marketId: params.marketId })
  const liquidityTransactions = await getMarketLiquidityTransactions({ marketId: params.marketId })
  const userLiquidity = liquidityTransactions.transactions.filter((t) => t.initiatorId)

  return <MarketLiquidityPage liquidityTransactions={userLiquidity} market={market} />
}
