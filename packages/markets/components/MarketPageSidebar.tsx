'use client'

import React from 'react'
import { isMarketResolved } from '../lib/helpers'
import { ExtendedMarket } from './MarketOverviewPage'
import { MarketTradePanel } from './MarketTradePanel'

export function MarketPageSidebar({ market, activeOptionId }: { market: ExtendedMarket; activeOptionId: string }) {
  return (
    <div className="space-y-8">
      <MarketTradePanel market={market} isResolved={isMarketResolved(market)} activeOptionId={activeOptionId} />

      {/* <div>
        <div className="text-xs font-semibold uppercase text-muted-foreground">Related questions</div>
        <ul className="divide-y divide-muted">
          <li className="flex items-start gap-2 py-2">
            <div className="w-8 flex-shrink-0 text-sm font-medium text-muted-foreground">44%</div>
            <div className="flex flex-col">
              <a href="#" className="text-sm text-primary-foreground">
                Will the price of Bitcoin reach $100,000 by the end of 2021?
              </a>
            </div>
          </li>

          <li className="flex items-start gap-2 py-2">
            <div className="w-8 flex-shrink-0 text-sm font-medium text-muted-foreground">15%</div>
            <div className="flex flex-col">
              <a href="#" className="text-sm text-primary-foreground">
                Will Ethereum flip Bitcoin by the end of 2022?
              </a>
            </div>
          </li>

          <li className="flex items-start gap-2 py-2">
            <div className="w-8 flex-shrink-0 text-sm font-medium text-muted-foreground">90%</div>
            <div className="flex flex-col">
              <a href="#" className="text-sm text-primary-foreground">
                Will the price of Ethereum reach $10,000 by the end of 2022?
              </a>
            </div>
          </li>
        </ul>
      </div> */}
    </div>
  )
}
