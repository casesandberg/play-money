'use client'

import { format } from 'date-fns'
import React from 'react'
import { AreaChart, ResponsiveContainer, YAxis, Tooltip as ChartTooltip, Area } from 'recharts'
import useSWR from 'swr'
import { useUserGraph } from '@play-money/api-helpers/client/hooks'
import { CurrencyDisplay } from '@play-money/finance/components/CurrencyDisplay'
import { Card } from '@play-money/ui/card'
import { cn } from '@play-money/ui/utils'

export function getTotalAmountChange(data: Array<{ endAt: Date; startAt: Date; balance: number }>) {
  data.forEach((point) => {
    point.endAt = new Date(point.endAt)
    point.startAt = new Date(point.startAt)
  })

  data.sort((a, b) => a.endAt.getTime() - b.endAt.getTime())

  const now = new Date()
  const oneWeekAgo = new Date(now)
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  let latestAmount = 0
  let oneWeekAgoAmount = data[0]?.balance ?? 0

  // Find the latest probability
  if (data.length > 0) {
    latestAmount = data[data.length - 1].balance
  }

  for (const item of data) {
    if (item.endAt <= oneWeekAgo) {
      oneWeekAgoAmount = item.balance
      break
    }
  }

  return {
    latestAmount,
    difference: (latestAmount - oneWeekAgoAmount) / oneWeekAgoAmount,
  }
}

const BALANCE_COLOR = '#333'
const LIQUIDITY_COLOR = '#7c3aed'
const MARKET_COLOR = '#facc15'

export function UserGraph({ userId }: { userId: string }) {
  const { data: graph } = useUserGraph({ userId })
  const change = getTotalAmountChange(graph?.data || [])

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-x-4 px-4 pt-4">
        <div className="text-lg font-medium text-muted-foreground">
          {change ? <CurrencyDisplay value={change.latestAmount} /> : null} Balance
        </div>

        {change.difference !== 0 && !Number.isNaN(change.difference) ? (
          <div
            className={cn(
              'flex-shrink-0 font-mono text-sm text-muted-foreground',
              change.difference > 0 ? 'text-primary' : 'text-destructive'
            )}
          >
            {change.difference > 0 ? '+' : ''}
            {Math.round(change.difference * 100)}% this week
          </div>
        ) : null}
      </div>
      <div className="h-32 p-4">
        {graph?.data ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart width={300} height={128} data={graph.data}>
              <ChartTooltip
                content={({ payload }) => {
                  const data = payload?.[0]?.payload
                  if (data) {
                    return (
                      <Card className="p-1 font-mono text-xs">
                        <div>{format(data.startAt, 'MMM d, yyyy')}</div>
                        <div style={{ color: MARKET_COLOR }}>
                          In markets: <CurrencyDisplay value={data.markets} />
                        </div>
                        <div style={{ color: LIQUIDITY_COLOR }}>
                          In liquidity: <CurrencyDisplay value={data.liquidity} />
                        </div>
                        <div style={{ color: BALANCE_COLOR }}>
                          Balance: <CurrencyDisplay value={data.balance} />
                        </div>
                      </Card>
                    )
                  }
                  return null
                }}
              />
              <YAxis type="number" domain={[0, 1]} hide />

              <defs>
                <linearGradient id="fillLiquidity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={LIQUIDITY_COLOR} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={LIQUIDITY_COLOR} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BALANCE_COLOR} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={BALANCE_COLOR} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="fillMarket" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={MARKET_COLOR} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={MARKET_COLOR} stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <Area
                type="step"
                dataKey="balance"
                fillOpacity={0.4}
                fill="url(#fillBalance)"
                stroke={BALANCE_COLOR}
                strokeWidth={2}
                strokeLinejoin="round"
                animationDuration={750}
                stackId={1}
              />
              <Area
                type="step"
                dataKey="liquidity"
                fill="url(#fillLiquidity)"
                fillOpacity={0.4}
                stroke={LIQUIDITY_COLOR}
                strokeWidth={2}
                strokeLinejoin="round"
                animationDuration={750}
                stackId={1}
              />
              <Area
                type="step"
                dataKey="markets"
                fill="url(#fillMarket)"
                fillOpacity={0.4}
                stroke={MARKET_COLOR}
                strokeWidth={2}
                strokeLinejoin="round"
                animationDuration={750}
                stackId={1}
              />
              <Area dataKey="totalAmount" />
            </AreaChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </Card>
  )
}
