'use client'

import { format, isPast } from 'date-fns'
import { CircleCheckBig, ChevronDown, Diamond } from 'lucide-react'
import React from 'react'
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip as ChartTooltip } from 'recharts'
import useSWR from 'swr'
import { CurrencyDisplay } from '@play-money/currencies/components/CurrencyDisplay'
import { formatNumber } from '@play-money/currencies/lib/formatCurrency'
import { Market, MarketOption, MarketResolution, User } from '@play-money/database'
import { NetBalanceAsNumbers } from '@play-money/finance/lib/getBalances'
import { marketOptionBalancesToProbabilities } from '@play-money/finance/lib/helpers'
import { UserAvatar } from '@play-money/ui/UserAvatar'
import { Alert, AlertDescription, AlertTitle } from '@play-money/ui/alert'
import { Badge } from '@play-money/ui/badge'
import { Button } from '@play-money/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@play-money/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@play-money/ui/collapsible'
import { ReadMoreEditor } from '@play-money/ui/editor'
import { Tooltip, TooltipContent, TooltipTrigger } from '@play-money/ui/tooltip'
import { UserLink } from '@play-money/users/components/UserLink'
import { useUser } from '@play-money/users/context/UserContext'
import { useSearchParam } from '../../ui/src/hooks/useSearchParam'
import { EditMarketDialog } from './EditMarketDialog'
import { LiquidityBoostAlert } from './LiquidityBoostAlert'
import { LiquidityBoostDialog, MarketStats } from './LiquidityBoostDialog'
import { MarketLikelyOption } from './MarketLikelyOption'
import { MarketOptionRow } from './MarketOptionRow'
import { MarketToolbar } from './MarketToolbar'
import { useSidebar } from './SidebarContext'

export type ExtendedMarket = Market & {
  user: User
  options: Array<MarketOption & { color: string; value?: number; cost?: number }>
  marketResolution?: MarketResolution & {
    resolution: MarketOption & { color: string }
    resolvedBy: User
  }
}

function getTextContrast(hex: string): string {
  const r = parseInt(hex.substring(1, 3), 16)
  const g = parseInt(hex.substring(3, 5), 16)
  const b = parseInt(hex.substring(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance > 0.5 ? '#000' : '#FFF'
}

export function MarketOverviewPage({
  market,
  renderComments,
  onRevalidate,
}: {
  market: ExtendedMarket
  renderComments: React.ReactNode
  onRevalidate: () => Promise<void>
}) {
  const { user } = useUser()
  const { triggerEffect } = useSidebar()
  const { data: balance } = useSWR<{ amm: Array<NetBalanceAsNumbers>; user: Array<NetBalanceAsNumbers> }>(
    `/v1/markets/${market.id}/balance`,
    { refreshInterval: 1000 * 60 }
  ) // 60 seconds
  const { data: graph } = useSWR(`/v1/markets/${market.id}/graph`, { refreshInterval: 1000 * 60 * 5 }) // 5 mins
  const { data: stats } = useSWR<MarketStats>(`/v1/markets/${market.id}/stats`, { refreshInterval: 1000 * 60 * 5 }) // 5 mins
  const [option, setOption] = useSearchParam('option', 'replace')
  const [isEditing, setIsEditing] = useSearchParam('edit')
  const [isBoosting, setIsBoosting] = useSearchParam('boost')
  const activeOptionId = option || market.options[0]?.id || ''
  const isCreator = user?.id === market.createdBy
  const probabilities = marketOptionBalancesToProbabilities(balance?.amm)

  return (
    <Card className="flex-1">
      <MarketToolbar
        market={market}
        canEdit={isCreator}
        onInitiateEdit={() => setIsEditing('true')}
        onInitiateBoost={() => setIsBoosting('true')}
      />

      <CardHeader className="pt-0 md:pt-0">
        <CardTitle className="leading-relaxed">{market.question}</CardTitle>
        <div className="flex flex-row flex-wrap gap-x-4 gap-y-2 font-mono text-sm text-muted-foreground md:flex-nowrap">
          {!market.marketResolution ? <MarketLikelyOption market={market} /> : null}

          {stats?.totalLiquidity ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-shrink-0 items-center gap-1">
                  <Diamond className="h-4 w-4 text-purple-600" />
                  <CurrencyDisplay value={stats.totalLiquidity} currencyCode="PRIMARY" isShort hasSymbol={false} />
                </div>
              </TooltipTrigger>
              <TooltipContent>Market liquidity</TooltipContent>
            </Tooltip>
          ) : null}
          {market.closeDate ? (
            <div className="flex-shrink-0">
              {isPast(market.closeDate) ? 'Ended' : 'Ending'} {format(market.closeDate, 'MMM d, yyyy')}
            </div>
          ) : null}
          {market.user ? (
            <div className="flex items-center gap-1 truncate">
              <UserAvatar user={market.user} size="sm" />
              <UserLink user={market.user} hideUsername />
            </div>
          ) : null}
          {/* <div>15 Traders</div>
          <div>$650 Volume</div> */}
        </div>
      </CardHeader>
      <CardContent>
        <Card className="h-32 p-4">
          {graph?.data ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart width={300} height={128} data={graph.data}>
                <ChartTooltip
                  content={({ payload }) => {
                    const data = payload?.[0]?.payload
                    if (data) {
                      return (
                        <Card className="p-1 text-sm">
                          {format(data.startAt, 'MMM d, yyyy')} · {Math.round(data.probability * 100)}%
                        </Card>
                      )
                    }
                    return null
                  }}
                />
                <YAxis type="number" domain={[0, 1]} hide />
                <Line
                  type="step"
                  dot={false}
                  dataKey="probability"
                  stroke={market.options[0]?.color}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  animationDuration={750}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : null}
        </Card>
      </CardContent>

      <CardContent>
        {market.marketResolution ? (
          <>
            <Alert>
              <CircleCheckBig style={{ color: market.marketResolution.resolution.color }} className="h-4 w-4" />
              <AlertTitle className="flex justify-between">
                <span className="text-lg leading-none">{market.marketResolution.resolution.name}</span>
                <Badge
                  style={{
                    backgroundColor: market.marketResolution.resolution.color,
                    color: getTextContrast(market.marketResolution.resolution.color),
                  }}
                >
                  Resolved
                </Badge>
              </AlertTitle>
              <AlertDescription className="text-muted-foreground">
                By <UserLink user={market.marketResolution.resolvedBy} /> on{' '}
                {format(market.marketResolution.updatedAt, 'MMM d, yyyy')}
              </AlertDescription>
              {market.marketResolution.supportingLink ? (
                <AlertDescription>
                  <a
                    href={market.marketResolution.supportingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    {market.marketResolution.supportingLink}
                  </a>
                </AlertDescription>
              ) : null}
            </Alert>
            {market.options.length ? (
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="text-muted-foreground" size="sm">
                    View more <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Card>
                    {market.options.map((option, i) => (
                      <MarketOptionRow
                        key={option.id}
                        option={option}
                        active={option.id === activeOptionId}
                        probability={probabilities[option.id] || 0}
                        className={i > 0 ? 'border-t' : ''}
                        onSelect={() => {
                          setOption(option.id)
                          triggerEffect()
                        }}
                      />
                    ))}
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            ) : null}
          </>
        ) : market.options.length ? (
          <Card>
            {market.options.map((option, i) => (
              <MarketOptionRow
                key={option.id}
                option={option}
                active={option.id === activeOptionId}
                probability={probabilities[option.id] || 0}
                className={i > 0 ? 'border-t' : ''}
                onSelect={() => {
                  setOption(option.id)
                  triggerEffect()
                }}
              />
            ))}
          </Card>
        ) : null}
      </CardContent>

      <CardContent>
        <ReadMoreEditor value={market.description} maxLines={6} />
      </CardContent>

      {!market.resolvedAt ? (
        <CardContent>
          <LiquidityBoostAlert onClick={() => setIsBoosting('true')} />
        </CardContent>
      ) : null}

      <div className="px-6 text-lg font-semibold">Comments</div>
      {renderComments}

      <EditMarketDialog
        market={market}
        open={isEditing === 'true'}
        onClose={() => setIsEditing(undefined)}
        onSuccess={onRevalidate}
      />
      <LiquidityBoostDialog
        market={market}
        stats={stats}
        open={isBoosting === 'true'}
        onClose={() => setIsBoosting(undefined)}
        onSuccess={onRevalidate}
      />
    </Card>
  )
}
