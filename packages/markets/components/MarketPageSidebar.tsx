'use client'

import React from 'react'
import { isMarketResolved, isMarketTradable } from '../lib/helpers'
import { ExtendedMarket } from '../types'
import { MarketTradePanel } from './MarketTradePanel'
import { RelatedMarkets } from './RelatedMarkets'

export function MarketPageSidebar({
  market,
  activeOptionId,
  onTradeComplete,
}: {
  market: ExtendedMarket
  activeOptionId: string
  onTradeComplete: () => void
}) {
  console.log(isMarketTradable(market))
  return (
    <div className="space-y-8">
      <MarketTradePanel
        market={market}
        isTradable={isMarketTradable(market)}
        isResolved={isMarketResolved(market)}
        activeOptionId={activeOptionId}
        onTradeComplete={onTradeComplete}
      />

      <RelatedMarkets marketId={market.id} />
    </div>
  )
}
