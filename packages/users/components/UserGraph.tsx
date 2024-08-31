'use client'

import { format } from 'date-fns'
import React from 'react'
import { AreaChart, ResponsiveContainer, YAxis, Tooltip as ChartTooltip, Area } from 'recharts'
import { useUserGraph } from '@play-money/api-helpers/client/hooks'
import { CurrencyDisplay } from '@play-money/finance/components/CurrencyDisplay'
import { Card } from '@play-money/ui/card'
import { cn } from '@play-money/ui/utils'

const BALANCE_COLOR = '#333'
const LIQUIDITY_COLOR = '#7c3aed'
const MARKET_COLOR = '#facc15'

export function UserGraph({ userId }: { userId: string }) {
  const { data: graph } = useUserGraph({ userId })
  const latestData = graph?.data[graph.data.length - 1]

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-x-4 px-4 pt-4">
        <div className="text-lg font-medium text-muted-foreground">
          {latestData ? <CurrencyDisplay value={latestData.balance} /> : null} Balance
        </div>

        {latestData?.liquidity ? (
          <div className="flex-shrink-0 font-mono text-sm" style={{ color: LIQUIDITY_COLOR }}>
            <CurrencyDisplay value={latestData.liquidity} /> in liquidity
          </div>
        ) : null}

        {latestData?.markets ? (
          <div className="flex-shrink-0 font-mono text-sm" style={{ color: MARKET_COLOR }}>
            <CurrencyDisplay value={latestData.markets} /> in markets
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
