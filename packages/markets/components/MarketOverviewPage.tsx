'use client'

import { format } from 'date-fns'
import { PanelRightClose } from 'lucide-react'
import React from 'react'
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'
import useSWR from 'swr'
import { Market, MarketOption } from '@play-money/database'
import { Button } from '@play-money/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@play-money/ui/card'
import { ReadMoreEditor } from '@play-money/ui/editor'
import { Progress } from '@play-money/ui/progress'
import { cn } from '@play-money/ui/utils'
import { useSearchParam } from '../../ui/src/hooks/useSearchParam'
import { useSidebar } from './SidebarContext'

export type ExtendedMarket = Market & { options: Array<MarketOption & { color: string }> }

function getProbabilityChange(data: Array<{ endAt: Date; startAt: Date; probability: number }>) {
  data.forEach((point) => {
    point.endAt = new Date(point.endAt)
    point.startAt = new Date(point.startAt)
  })

  data.sort((a, b) => a.endAt.getTime() - b.endAt.getTime())

  const now = new Date()
  const oneWeekAgo = new Date(now)
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  let latestProbability = 0.5
  let oneWeekAgoProbability = 0.5

  // Find the latest probability
  if (data.length > 0) {
    latestProbability = data[data.length - 1].probability
  }

  for (const [i, item] of data.entries()) {
    if (item.endAt <= oneWeekAgo) {
      oneWeekAgoProbability = item.probability
      break
    }
  }

  const difference = latestProbability - oneWeekAgoProbability

  return {
    latestProbability: latestProbability,
    difference: latestProbability - oneWeekAgoProbability,
  }
}

export function MarketOverviewPage({
  market,
  renderComments,
}: {
  market: ExtendedMarket
  renderComments: React.ReactNode
}) {
  const { triggerEffect } = useSidebar()
  const { data: balance } = useSWR(`/v1/markets/${market.id}/balance`, { refreshInterval: 1000 * 60 }) // 60 seconds
  const { data: graph } = useSWR(`/v1/markets/${market.id}/graph`, { refreshInterval: 1000 * 60 * 5 }) // 5 mins
  const [option, setOption] = useSearchParam('option')
  const activeOptionId = option || market.options[0]?.id || ''

  const mostLikelyProbability = Math.max(
    ...market.options.map((option) => balance?.probability[option.currencyCode] || 0)
  )
  const mostLikelyOption = market.options.find(
    (option) => balance?.probability[option.currencyCode] === mostLikelyProbability
  )

  const change = getProbabilityChange(graph?.data || [])

  return (
    <Card className="flex-1">
      <CardHeader className="px-7">
        <CardTitle className="leading-relaxed">{market.question}</CardTitle>
        <div className="flex flex-row gap-4 text-sm text-muted-foreground">
          {mostLikelyOption ? (
            <>
              <div style={{ color: mostLikelyOption.color }} className="font-semibold">
                {Math.round(mostLikelyProbability * 100)}% {mostLikelyOption.name}
              </div>

              {change.difference !== 0 ? (
                <div>
                  {change.difference > 0 ? '+' : '-'}
                  {Math.round(change.difference * 100)}% this week
                </div>
              ) : null}
            </>
          ) : null}
          {market.closeDate ? <div>Closes {format(market.closeDate, 'MMM d, yyyy')}</div> : null}
          {/* <div>15 Traders</div>
          <div>$650 Volume</div> */}
        </div>
      </CardHeader>
      <CardContent>
        <Card className="h-32 p-4">
          {graph?.data ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart width={300} height={128} data={graph.data}>
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

      {market.options.length ? (
        <CardContent>
          <Card>
            {market.options.map((option, i) => {
              const probability = balance?.probability[option.currencyCode] || 0
              return (
                <div
                  className={cn(
                    'flex cursor-pointer flex-row items-center p-4 hover:bg-muted/50',
                    i > 0 && 'border-t',
                    option.id === activeOptionId && 'bg-muted/50'
                  )}
                  key={option.id}
                  onClick={() => setOption(option.id)}
                >
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="font-semibold leading-none">{option.name}</div>
                    <div className="flex flex-row items-center gap-2">
                      <div className="text-xs font-semibold leading-none" style={{ color: option.color }}>
                        {Math.round(probability * 100)}%
                      </div>
                      <Progress
                        className="h-2 max-w-[200px] transition-transform"
                        data-color={option.color}
                        indicatorStyle={{ backgroundColor: option.color }}
                        value={probability * 100}
                      />
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={option.id === activeOptionId ? 'black' : 'outline'}
                    onClick={triggerEffect}
                  >
                    Bet
                  </Button>
                </div>
              )
            })}
          </Card>
        </CardContent>
      ) : null}

      <CardContent>
        <ReadMoreEditor value={market.description} maxLines={6} />
      </CardContent>

      <div className="px-6 text-lg font-semibold">Comments</div>
      {renderComments}
    </Card>
  )
}
