'use client'

import React from 'react'
import { useSWRConfig } from 'swr'
import { useSearchParam } from '@play-money/ui'
import { Button } from '@play-money/ui/button'
import { Card, CardContent, CardHeader } from '@play-money/ui/card'
import { Combobox } from '@play-money/ui/combobox'
import { Input } from '@play-money/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@play-money/ui/tabs'
import { cn } from '@play-money/ui/utils'
import { ExtendedMarket } from './MarketOverviewPage'
import { useSidebar } from './SidebarContext'

// TODO: @casesandberg Extract and create form component

export function MarketPageSidebar({ market, activeOptionId }: { market: ExtendedMarket; activeOptionId: string }) {
  const { mutate } = useSWRConfig()
  const [option, setOption] = useSearchParam('option')
  const { effect, resetEffect } = useSidebar()

  const handlePlaceBet = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/markets/${market.id}/buy`, {
      method: 'POST',
      body: JSON.stringify({
        optionId: option,
        amount: 50,
      }),
      credentials: 'include',
    })
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
            {market.options.length !== 2 ? (
              <div className="space-y-2">
                <div className="font-semibold">Outcome</div>
                <div className="flex flex-row gap-3">
                  <Button className="flex-1">Yes</Button>
                  <Button className="flex-1" variant="secondary">
                    No
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="font-semibold">Amount</div>
              <div className="flex flex-row gap-3">
                <Input placeholder="50" type="number" />
              </div>
            </div>

            <Button className="w-full" onClick={handlePlaceBet}>
              Place bet
            </Button>

            <ul className="grid gap-3 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">New probability</span>
                <span>74% (↑2%)</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Potential return</span>
                <span>$36.36 (81.81%)</span>
              </li>
            </ul>
          </TabsContent>
          <TabsContent value="sell">Sell panel</TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
