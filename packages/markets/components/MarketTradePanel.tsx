'use client'

import React from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { CurrencyDisplay } from '@play-money/currencies/components/CurrencyDisplay'
import { NetBalanceAsNumbers } from '@play-money/finance/lib/getBalances'
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
  // We can SSR this now, since the P&L will be the one thats updated externally and this one will only ever be updated by a user!
  const { data: balance } = useSWR<{ amm: Array<NetBalanceAsNumbers>; user: Array<NetBalanceAsNumbers> }>(
    `/v1/markets/${market.id}/balance`,
    { refreshInterval: 1000 * 60 }
  ) // 60 seconds
  const { mutate } = useSWRConfig()
  const [option, setOption] = useSearchParam('option')
  const { effect, resetEffect } = useSidebar()
  const activeOption = market.options.find((o) => o.id === (option || activeOptionId))
  const activeOptionUserBalance = balance?.user.find(
    (balance) => balance.assetType === 'MARKET_OPTION' && balance.assetId === activeOption?.id
  )

  const handleRefresh = async () => {
    void mutate('/v1/users/me/balance')
    void mutate(`/v1/markets/${market.id}/balance`)
    void mutate(`/v1/markets/${market.id}/graph`)
  }

  const primaryBalance = balance?.user.find((b) => b.assetId === 'PRIMARY')

  const primaryQuestSum =
    (primaryBalance?.subtotals['DAILY_TRADE_BONUS'] || 0) +
    (primaryBalance?.subtotals['DAILY_COMMENT_BONUS'] || 0) +
    (primaryBalance?.subtotals['DAILY_MARKET_BONUS'] || 0) +
    (primaryBalance?.subtotals['DAILY_LIQUIDITY_BONUS'] || 0)

  const unrealizedSum = market.options.reduce((total, option) => total + (option.value || 0), 0)

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
                    max={activeOptionUserBalance?.amount}
                  />
                ) : null}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      ) : null}

      {unrealizedSum !== 0 ? (
        <Card>
          <CardContent className="flex flex-col gap-2 p-3 md:py-4">
            <div className="flex justify-between font-mono text-sm font-semibold">
              <span>Open positions</span>
              <CurrencyDisplay value={unrealizedSum} currencyCode="PRIMARY" />
            </div>
            <div>
              {market.options.map((option) => {
                const change =
                  option.cost && option.value ? Math.round(((option.value - option.cost) / option.cost) * 100) : 0
                return option.value != undefined ? (
                  <div key={option.id} className="flex justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="size-2 rounded-md" style={{ backgroundColor: option.color }} />
                      <span className="font-mono">{option.name}</span>
                    </div>
                    <div className="flex gap-2">
                      {change ? (
                        <span
                          className={change > 0 ? 'text-lime-500' : 'text-red-400'}
                        >{`(${change > 0 ? '+' : ''}${change}%)`}</span>
                      ) : null}
                      <CurrencyDisplay value={option.value} currencyCode="PRIMARY" />
                    </div>
                  </div>
                ) : null
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {primaryBalance?.amount ? (
        <Card>
          <CardContent className="flex flex-col gap-2 p-3 md:py-4">
            <div className="flex justify-between font-mono text-sm font-semibold">
              <span>Balance</span>
              <CurrencyDisplay value={primaryBalance?.amount} currencyCode="PRIMARY" />
            </div>
            <div className="text-xs text-muted-foreground">
              {primaryBalance?.subtotals['MARKET_RESOLVE_WIN'] ? (
                <div className="flex justify-between gap-2">
                  <span className="font-mono">Market resolution</span>
                  <CurrencyDisplay value={primaryBalance?.subtotals['MARKET_RESOLVE_WIN']} currencyCode="PRIMARY" />
                </div>
              ) : null}

              {primaryBalance?.subtotals['MARKET_SELL'] ? (
                <div className="flex justify-between gap-2">
                  <span className="font-mono">Market sell</span>
                  <CurrencyDisplay value={primaryBalance?.subtotals['MARKET_SELL']} currencyCode="PRIMARY" />
                </div>
              ) : null}

              {primaryBalance?.subtotals['MARKET_BUY'] ? (
                <div className="flex justify-between gap-2">
                  <span className="font-mono">Market buy</span>
                  <CurrencyDisplay value={primaryBalance?.subtotals['MARKET_BUY']} currencyCode="PRIMARY" />
                </div>
              ) : null}

              {primaryBalance?.subtotals['MARKET_LIQUIDITY'] ? (
                <div className="flex justify-between gap-2">
                  <span className="font-mono">Liquidity added</span>
                  <CurrencyDisplay value={primaryBalance?.subtotals['MARKET_LIQUIDITY']} currencyCode="PRIMARY" />
                </div>
              ) : null}

              {primaryBalance?.subtotals['MARKET_TRADER_BONUS'] ? (
                <div className="flex justify-between gap-2">
                  <span className="font-mono">Liquidity distribution</span>
                  <CurrencyDisplay value={primaryBalance?.subtotals['MARKET_TRADER_BONUS']} currencyCode="PRIMARY" />
                </div>
              ) : null}

              {primaryBalance?.subtotals['MARKET_EXCESS_LIQUIDITY'] ? (
                <div className="flex justify-between gap-2">
                  <span className="font-mono">Liquidity returned</span>
                  <CurrencyDisplay
                    value={primaryBalance?.subtotals['MARKET_EXCESS_LIQUIDITY']}
                    currencyCode="PRIMARY"
                  />
                </div>
              ) : null}

              {primaryQuestSum ? (
                <div className="flex justify-between gap-2">
                  <span className="font-mono">Daily quests</span>
                  <CurrencyDisplay value={primaryQuestSum} currencyCode="PRIMARY" />
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
