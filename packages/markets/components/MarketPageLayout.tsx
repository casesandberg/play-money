'use client'

import React from 'react'
import { useSearchParam } from '@play-money/ui'
import { Button } from '@play-money/ui/button'
import { Card, CardContent, CardHeader } from '@play-money/ui/card'
import { Combobox } from '@play-money/ui/combobox'
import { Input } from '@play-money/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@play-money/ui/tabs'
import { ExtendedMarket } from './MarketOverviewPage'

// TODO: @casesandberg Extract and create form component

export function MarketPageLayout({
  market,
  children,
  activeOptionId,
}: {
  market: ExtendedMarket
  children: React.ReactNode
  activeOptionId: string
}) {
  const [option, setOption] = useSearchParam('option')
  return (
    <main className="mx-auto flex max-w-screen-lg flex-1 flex-row items-start gap-8 p-4 sm:px-6 sm:py-0 md:gap-8">
      {children}

      <Card className="max-w-80 flex-1">
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

              <Button className="w-full">Place bet</Button>

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
    </main>
  )
}
