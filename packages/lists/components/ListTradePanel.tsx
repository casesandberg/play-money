'use client'

import { CircleOffIcon } from 'lucide-react'
import React from 'react'
import { mutate } from 'swr'
import { LIST_BALANCE_PATH, MY_BALANCE_PATH, useListBalance } from '@play-money/api-helpers/client/hooks'
import { MarketBalanceBreakdown } from '@play-money/markets/components/MarketBalanceBreakdown'
import { MarketBuyForm } from '@play-money/markets/components/MarketBuyForm'
import { MarketLeaderboardPanel } from '@play-money/markets/components/MarketLeaderboardPanel'
import { MarketSellForm } from '@play-money/markets/components/MarketSellForm'
import { useSidebar } from '@play-money/markets/components/SidebarContext'
import { isMarketCanceled, isMarketResolved, isMarketTradable } from '@play-money/markets/rules'
import { useSelectedItems } from '@play-money/ui'
import { Card, CardContent, CardHeader } from '@play-money/ui/card'
import { Combobox } from '@play-money/ui/combobox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@play-money/ui/tabs'
import { cn } from '@play-money/ui/utils'
import { ExtendedList } from '../types'

export function ListTradePanel({ list, onTradeComplete }: { list: ExtendedList; onTradeComplete?: () => void }) {
  const { selected, setSelected } = useSelectedItems()
  const { effect, resetEffect } = useSidebar()
  const { data: balanceData, mutate: revalidate } = useListBalance({ listId: list.id })
  const balance = balanceData?.data
  const selectedMarket = list.markets.find((m) => m.market.id === selected[0])

  const isTradable = selectedMarket ? isMarketTradable(selectedMarket) : false
  const isResolved = selectedMarket ? isMarketResolved(selectedMarket) : false
  const isCanceled = selectedMarket ? isMarketCanceled(selectedMarket) : false

  const handleComplete = async () => {
    void mutate(MY_BALANCE_PATH)
    void mutate(LIST_BALANCE_PATH(list.id))
    void onTradeComplete?.()
    revalidate()
  }

  const primaryBalances = balance?.user.filter((b) => b.assetId === 'PRIMARY')
  const primaryBalanceSum = balance?.user
    .filter((b) => b.assetId === 'PRIMARY')
    .reduce((sum, position) => sum + position.total, 0)
  const positionsSum = (balance?.userPositions ?? []).reduce((sum, position) => sum + position.value, 0)
  const total = (primaryBalanceSum || 0) + positionsSum

  return (
    <div className="space-y-4">
      {isCanceled ? (
        <Card className="flex flex-col items-center justify-center gap-4 p-4 sm:h-64">
          <CircleOffIcon className="size-8 stroke-[1.5px] text-muted-foreground" />
          <div className="text-balance text-center text-sm uppercase text-muted-foreground">Question canceled</div>
        </Card>
      ) : isTradable ? (
        <Card className={cn(effect && 'animate-slide-in-right')} onAnimationEnd={resetEffect}>
          <Tabs defaultValue="buy">
            <CardHeader className="flex items-start bg-muted md:p-3">
              <Combobox
                buttonClassName="bg-muted w-full text-lg border-none"
                value={selectedMarket?.market.id}
                onChange={(value) => setSelected([value])}
                items={list.markets.map((option) => ({ value: option.market.id, label: option.market.question }))}
              />
              <TabsList className="ml-3 p-0">
                <TabsTrigger value="buy">Buy</TabsTrigger>
                <TabsTrigger value="sell">Sell</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="mt-4">
              <TabsContent className="space-y-4" value="buy">
                {selectedMarket ? (
                  <MarketBuyForm
                    marketId={selectedMarket.market.id}
                    options={selectedMarket.market.options}
                    onComplete={handleComplete}
                  />
                ) : null}
              </TabsContent>
              <TabsContent value="sell">
                {selectedMarket ? (
                  <MarketSellForm
                    positions={balance?.userPositions}
                    options={selectedMarket.market.options}
                    marketId={selectedMarket.market.id}
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
      ) : selectedMarket ? (
        <MarketLeaderboardPanel market={selectedMarket.market} />
      ) : null}

      {total ? (
        <Card>
          <CardContent className="flex flex-col gap-2 p-3 md:py-4">
            <div className="flex justify-between font-semibold">
              <span>Balance</span>
            </div>

            <MarketBalanceBreakdown
              markets={list.markets.map((m) => m.market)}
              balances={primaryBalances}
              positions={balance?.userPositions ?? []}
              options={list.markets.map((m) => m.market.options).flat()}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
