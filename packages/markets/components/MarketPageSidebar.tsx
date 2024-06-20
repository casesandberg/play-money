'use client'

import React from 'react'
import { useSWRConfig } from 'swr'
import { useSearchParam } from '@play-money/ui'
import { Card, CardContent, CardHeader } from '@play-money/ui/card'
import { Combobox } from '@play-money/ui/combobox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@play-money/ui/tabs'
import { cn } from '@play-money/ui/utils'
import { MarketBuyForm } from './MarketBuyForm'
import { ExtendedMarket } from './MarketOverviewPage'
import { useSidebar } from './SidebarContext'

// TODO: @casesandberg Extract and create form component

export function MarketPageSidebar({ market, activeOptionId }: { market: ExtendedMarket; activeOptionId: string }) {
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
    <Card className={cn(effect && 'animate-slide-in-right')} onAnimationEnd={resetEffect}>
      <Tabs defaultValue="buy">
        <CardHeader className="flex items-start bg-muted p-3">
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
          <TabsContent value="sell">Sell panel</TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
