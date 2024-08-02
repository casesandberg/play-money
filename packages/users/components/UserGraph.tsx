'use client'

import { format } from 'date-fns'
import React from 'react'
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip as ChartTooltip, Area } from 'recharts'
import useSWR from 'swr'
import { CurrencyDisplay } from '@play-money/currencies/components/CurrencyDisplay'
import { Card } from '@play-money/ui/card'
import { cn } from '@play-money/ui/utils'

export function getTotalAmountChange(data: Array<{ endAt: Date; startAt: Date; totalAmount: number }>) {
  data.forEach((point) => {
    point.endAt = new Date(point.endAt)
    point.startAt = new Date(point.startAt)
  })

  data.sort((a, b) => a.endAt.getTime() - b.endAt.getTime())

  const now = new Date()
  const oneWeekAgo = new Date(now)
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  let latestAmount = 0
  let oneWeekAgoAmount = data[0]?.totalAmount ?? 0

  // Find the latest probability
  if (data.length > 0) {
    latestAmount = data[data.length - 1].totalAmount
  }

  for (const item of data) {
    if (item.endAt <= oneWeekAgo) {
      oneWeekAgoAmount = item.totalAmount
      break
    }
  }

  return {
    latestAmount,
    difference: (latestAmount - oneWeekAgoAmount) / oneWeekAgoAmount,
  }
}

export function UserGraph({ userId }: { userId: string }) {
  const { data: graph } = useSWR(`/v1/users/${userId}/graph`, { refreshInterval: 1000 * 60 * 5 }) // 5 mins
  const change = getTotalAmountChange(graph?.data || [])

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-x-4 px-4 pt-4">
        <div className="text-lg font-medium text-muted-foreground">
          {change ? <CurrencyDisplay value={change.latestAmount} currencyCode="PRIMARY" /> : null} Net Worth
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
            <LineChart width={300} height={128} data={graph.data}>
              <ChartTooltip
                content={({ payload }) => {
                  const data = payload?.[0]?.payload
                  if (data) {
                    return (
                      <Card className="p-1 text-sm">
                        {format(data.startAt, 'MMM d, yyyy')} ·{' '}
                        <CurrencyDisplay value={data.totalAmount} currencyCode="PRIMARY" />
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
                dataKey="totalAmount"
                stroke={'#333'}
                strokeWidth={2.5}
                strokeLinejoin="round"
                animationDuration={750}
              />
              <Area dataKey="totalAmount" />
            </LineChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </Card>
  )
}
