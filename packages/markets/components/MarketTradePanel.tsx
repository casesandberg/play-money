'use client'

import React from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { useSearchParam } from '@play-money/ui'
import { Card, CardContent, CardHeader } from '@play-money/ui/card'
import { Combobox } from '@play-money/ui/combobox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@play-money/ui/tabs'
import { cn } from '@play-money/ui/utils'
import { MarketStats } from './LiquidityBoostDialog'
import { MarketBuyForm } from './MarketBuyForm'
import { ExtendedMarket } from './MarketOverviewPage'
import { MarketSellForm } from './MarketSellForm'
import { useSidebar } from './SidebarContext'

export function MarketTradePanel({
  market,
  isResolved = false,
  activeOptionId,
}: {
  market: ExtendedMarket
  isResolved: boolean
  activeOptionId: string
}) {
  const { data: balance } = useSWR(`/v1/markets/${market.id}/balance`, { refreshInterval: 1000 * 60 }) // 60 seconds
  const { data: stats } = useSWR<MarketStats>(`/v1/markets/${market.id}/stats`, { refreshInterval: 1000 * 60 * 5 }) // 5 mins
  const { mutate } = useSWRConfig()
  const [option, setOption] = useSearchParam('option')
  const { effect, resetEffect } = useSidebar()
  const activeOption = market.options.find((o) => o.id === (option || activeOptionId))

  const handleRefresh = async () => {
    void mutate('/v1/users/me/balance')
    void mutate(`/v1/markets/${market.id}/balance`)
    void mutate(`/v1/markets/${market.id}/graph`)
  }

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
                  <MarketBuyForm marketId={market.id} option={activeOption} onComplete={handleRefresh} />
                ) : null}
              </TabsContent>
              <TabsContent value="sell">
                {activeOption ? (
                  <MarketSellForm
                    marketId={market.id}
                    option={activeOption}
                    onComplete={handleRefresh}
                    max={balance?.holdings[activeOption.currencyCode]}
                  />
                ) : null}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      ) : null}
      {Math.round(balance?.holdings.YES) > 0 ||
      Math.round(balance?.holdings.NO) > 0 ||
      Object.values(stats?.earnings || []).some((value) => !!value) ? (
        <Card>
          <CardContent className="flex flex-col gap-4 p-3 text-sm md:py-4">
            {Math.round(balance?.holdings.YES) > 0 || Math.round(balance?.holdings.NO) > 0 ? (
              <div>
                <div className="mb-1 font-medium text-muted-foreground">Open positions</div>
                <div className="space-y-2">
                  {market.options.map((option) => {
                    const shares = balance?.holdings[option.currencyCode]
                    const position = stats?.positions[option.id]
                    return shares && position ? (
                      <div key={option.id}>
                        <div className="flex  justify-between gap-2">
                          <div className="font-semibold" style={{ color: option.color }}>
                            ${Math.round(position.value)} {option.name}
                            <span className="ml-2 text-xs font-normal text-foreground">
                              ({Math.round(((position.value - position.cost) / position.cost) * 100) > 0 ? '+' : ''}
                              {Math.round(((position.value - position.cost) / position.cost) * 100)}%)
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <div>Cost ${Math.round(position.cost)}</div>
                          <div>Payout ${Math.round(position.payout)}</div>
                        </div>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            ) : null}

            {Object.values(stats?.earnings || []).some((value) => !!value) ? (
              <div>
                <div className="mb-1 font-medium text-muted-foreground">Earnings</div>

                {stats?.earnings.held ? (
                  <div className="flex justify-between gap-2">
                    <span>Held positions</span>
                    <div className="font-semibold">
                      <span>${Math.round(stats.earnings.held)} </span>
                    </div>
                  </div>
                ) : null}

                {stats?.earnings.sold ? (
                  <div className="flex justify-between gap-2">
                    <span>Sold positions</span>
                    <div className="font-semibold">
                      <span>${Math.round(stats.earnings.sold)} </span>
                    </div>
                  </div>
                ) : null}

                {stats?.earnings.traderBonusPayouts ? (
                  <div className="flex justify-between gap-2">
                    <span>Trader Bonuses:</span>
                    <div className="font-semibold">
                      <span>${Math.round(stats.earnings.traderBonusPayouts)} </span>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
