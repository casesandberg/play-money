'use client'

import React from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { useSearchParam } from '@play-money/ui'
import { Card, CardContent, CardHeader } from '@play-money/ui/card'
import { Combobox } from '@play-money/ui/combobox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@play-money/ui/tabs'
import { cn } from '@play-money/ui/utils'
import { MarketBuyForm } from './MarketBuyForm'
import { ExtendedMarket } from './MarketOverviewPage'
import { MarketSellForm } from './MarketSellForm'
import { useSidebar } from './SidebarContext'

type MarketStats = {
  totalLiquidity: number
  lpUserCount: number
  traderBonusPayouts: number
  holdings: {
    traderBonusPayouts?: number
  }
}

export function MarketTradePanel({ market, activeOptionId }: { market: ExtendedMarket; activeOptionId: string }) {
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
      {Math.round(balance?.holdings.YES) > 0 ||
      Math.round(balance?.holdings.NO) > 0 ||
      stats?.holdings.traderBonusPayouts ? (
        <Card>
          <CardContent className="flex flex-col gap-2 p-3 text-sm md:py-4">
            {Math.round(balance?.holdings.YES) > 0 || Math.round(balance?.holdings.NO) > 0 ? (
              <div className="flex gap-2">
                <span className="text-muted-foreground">Holdings:</span>
                {market.options.map((option) => {
                  const shares = balance?.holdings[option.currencyCode]
                  return shares ? (
                    <div key={option.id} className="font-semibold" style={{ color: option.color }}>
                      <span>${Math.round(balance?.holdings[option.currencyCode])} </span>
                      <span>{option.name}</span>
                    </div>
                  ) : null
                })}
              </div>
            ) : null}

            {stats?.holdings.traderBonusPayouts ? (
              <div className="flex gap-2">
                <span className="text-muted-foreground">Trader Bonuses:</span>
                <div className="font-semibold">
                  <span>${Math.round(stats.holdings.traderBonusPayouts)} </span>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
