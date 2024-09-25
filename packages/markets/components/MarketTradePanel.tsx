'use client'

import { CircleOffIcon } from 'lucide-react'
import React from 'react'
import { mutate } from 'swr'
import {
  MARKET_BALANCE_PATH,
  MARKET_GRAPH_PATH,
  MY_BALANCE_PATH,
  useMarketBalance,
} from '@play-money/api-helpers/client/hooks'
import { useSelectedItems } from '@play-money/ui'
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
  isTradable = true,
  isResolved = false,
  onTradeComplete,
}: {
  market: ExtendedMarket
  isTradable?: boolean
  isResolved: boolean
  onTradeComplete?: () => void
}) {
  const { selected, setSelected } = useSelectedItems()
  // We can SSR this now, since the P&L will be the one thats updated externally and this one will only ever be updated by a user!
  const { data: balance, mutate: revalidate } = useMarketBalance({ marketId: market.id })
  const { effect, resetEffect } = useSidebar()
  const activeOption = market.options.find((o) => o.id === selected[0])
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
      {isTradable ? (
        <Card className={cn(effect && 'animate-slide-in-right')} onAnimationEnd={resetEffect}>
          <Tabs defaultValue="buy">
            <CardHeader className="flex items-start bg-muted md:p-3">
              <Combobox
                buttonClassName="bg-muted w-full text-lg border-none"
                value={activeOption?.id}
                onChange={(value) => setSelected([value])}
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
                  <MarketBuyForm marketId={market.id} options={[activeOption]} onComplete={handleComplete} />
                ) : null}
              </TabsContent>
              <TabsContent value="sell">
                {activeOption ? (
                  <MarketSellForm
                    marketId={market.id}
                    positions={activePosition ? [activePosition] : undefined}
                    options={[activeOption]}
                    onComplete={handleComplete}
                  />
                ) : null}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      ) : !isResolved ? (
        <Card className="flex flex-col items-center justify-center gap-4 p-4 sm:h-64">
          <CircleOffIcon className="size-8 stroke-[1.5px] text-muted-foreground" />
          <div className="text-balance text-center text-sm uppercase text-muted-foreground">Trading closed</div>
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
              balances={primaryBalance ? [primaryBalance] : []}
              positions={balance?.userPositions ?? []}
              options={market.options}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
