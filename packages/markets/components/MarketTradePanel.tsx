'use client'

import React from 'react'
import { mutate } from 'swr'
import {
  MARKET_BALANCE_PATH,
  MARKET_GRAPH_PATH,
  MY_BALANCE_PATH,
  useMarketBalance,
} from '@play-money/api-helpers/client/hooks'
import { CurrencyDisplay } from '@play-money/finance/components/CurrencyDisplay'
import { useSearchParam } from '@play-money/ui'
import { Card, CardContent, CardHeader } from '@play-money/ui/card'
import { Combobox } from '@play-money/ui/combobox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@play-money/ui/tabs'
import { cn } from '@play-money/ui/utils'
import { ExtendedMarket } from '../types'
import { MarketBalanceBreakdown } from './MarketBalanceBreakdown'
import { MarketBuyForm } from './MarketBuyForm'
import { MarketLeaderboardPanel } from './MarketLeaderboardPanel'
import { MarketSellForm } from './MarketSellForm'
import { useSidebar } from './SidebarContext'

export function MarketTradePanel({
  market,
  isResolved = false,
  activeOptionId,
  onTradeComplete,
}: {
  market: ExtendedMarket
  isResolved: boolean
  activeOptionId: string
  onTradeComplete?: () => void
}) {
  // We can SSR this now, since the P&L will be the one thats updated externally and this one will only ever be updated by a user!
  const { data: balance, mutate: revalidate } = useMarketBalance({ marketId: market.id })
  const [option, setOption] = useSearchParam('option')
  const { effect, resetEffect } = useSidebar()
  const activeOption = market.options.find((o) => o.id === (option || activeOptionId))
  const activePosition = balance?.userPositions.find((p) => p.optionId === activeOption?.id)

  const handleComplete = async () => {
    void mutate(MY_BALANCE_PATH)
    void mutate(MARKET_BALANCE_PATH(market.id))
    void mutate(MARKET_GRAPH_PATH(market.id))
    void revalidate()
    void onTradeComplete?.()
  }

  const primaryBalance = balance?.user.find((b) => b.assetId === 'PRIMARY')
  const positionsSum = (balance?.userPositions ?? []).reduce((sum, position) => sum + position.value, 0)
  const total = (primaryBalance?.total || 0) + positionsSum

  return (
    <div className="space-y-4">
      {!isResolved ? (
        <Card className={cn(effect && 'animate-slide-in-right')} onAnimationEnd={resetEffect}>
          <Tabs defaultValue="buy">
            <CardHeader className="flex items-start bg-muted md:p-3">
              <Combobox
                buttonClassName="bg-muted w-full text-lg border-none"
                value={option || activeOptionId}
                onChange={(value) => setOption(value)}
                items={market.options.map((option) => ({ value: option.id, label: option.name }))}
              />
              <TabsList className="ml-3 p-0">
                <TabsTrigger value="buy">Buy</TabsTrigger>
                <TabsTrigger value="sell">Sell</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="mt-4">
              <TabsContent className="space-y-4" value="buy">
                {activeOption ? (
                  <MarketBuyForm marketId={market.id} option={activeOption} onComplete={handleComplete} />
                ) : null}
              </TabsContent>
              <TabsContent value="sell">
                {activeOption ? (
                  <MarketSellForm
                    marketId={market.id}
                    position={activePosition}
                    option={activeOption}
                    onComplete={handleComplete}
                  />
                ) : null}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      ) : (
        <MarketLeaderboardPanel market={market} />
      )}

      {total ? (
        <Card>
          <CardContent className="flex flex-col gap-2 p-3 md:py-4">
            <div className="flex justify-between font-semibold">
              <span>Balance</span>
            </div>

            <MarketBalanceBreakdown
              balance={primaryBalance}
              positions={balance?.userPositions ?? []}
              options={market.options}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
