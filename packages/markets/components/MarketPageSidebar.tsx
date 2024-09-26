'use client'

import React from 'react'
import { isMarketResolved, isMarketTradable } from '../rules'
import { ExtendedMarket } from '../types'
import { MarketTradePanel } from './MarketTradePanel'
import { RelatedMarkets } from './RelatedMarkets'

export function MarketPageSidebar({
  market,
  onTradeComplete,
}: {
  market: ExtendedMarket
  onTradeComplete: () => void
}) {
  return (
    <div className="space-y-8">
      <MarketTradePanel
        market={market}
        isTradable={isMarketTradable({ market })}
        isResolved={isMarketResolved({ market })}
        onTradeComplete={onTradeComplete}
      />

      <RelatedMarkets marketId={market.id} />
    </div>
  )
}
