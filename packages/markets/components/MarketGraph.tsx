import { format } from 'date-fns'
import _ from 'lodash'
import React from 'react'
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, CartesianGrid, Tooltip as ChartTooltip } from 'recharts'
import { useMarketGraph } from '@play-money/api-helpers/client/hooks'
import { Card } from '@play-money/ui/card'
import { ExtendedMarket } from '../types'

function CustomizedXAxisTick({ x, y, payload }: { x: number; y: number; payload: { value: string } }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={5} dx={-4} textAnchor="end" className="fill-muted-foreground/50">
        {format(payload.value, 'MMM d')}
      </text>
    </g>
  )
}

function CustomizedYAxisTick({ x, y, payload }: { x: number; y: number; payload: { value: string | number } }) {
  return payload.value !== 0 ? (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} dx={2} textAnchor="start" className="fill-muted-foreground/50">
        {payload.value}%
      </text>
    </g>
  ) : (
    <g />
  )
}

export function MarketGraph({ market, activeOptionId }: { market: ExtendedMarket; activeOptionId: string }) {
  const { data: graph } = useMarketGraph({ marketId: market.id })
  const activeOptionIndex = market.options.findIndex((o) => o.id === activeOptionId)

  return (
    <Card className="h-40">
      {graph?.data ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart width={300} height={128} data={graph.data} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
            <ChartTooltip
              content={({ payload }) => {
                const data = payload?.[0]?.payload
                if (data) {
                  return (
                    <Card className="p-1 font-mono text-xs">
                      <div>{format(data.startAt, 'MMM d, yyyy')}</div>
                      {market.options.map((option, i) => (
                        <div key={option.id} style={{ color: option.color }}>
                          {option.name}: {data.options[i].probability}%
                        </div>
                      ))}
                    </Card>
                  )
                }
                return null
              }}
            />
            <XAxis
              height={20}
              dataKey="endAt"
              stroke="hsl(var(--border))"
              // axisLine={false}
              className="font-mono text-[10px] uppercase"
              minTickGap={80}
              tick={CustomizedXAxisTick}
              tickFormatter={(value) => format(value, 'MMM d')}
            />
            <YAxis
              type="number"
              domain={[0, 100]}
              width={40}
              stroke="hsl(var(--border))"
              className="font-mono text-[10px] uppercase"
              orientation="right"
              tick={CustomizedYAxisTick}
              tickFormatter={(value, i) => (value !== 0 && value !== 100 ? `${value}%` : '')}
            />
            {market.options.map((option, i) => (
              <Line
                key={option.id}
                type="step"
                dot={false}
                dataKey={(data) => data.options[i].probability}
                stroke={option.color}
                opacity={0.4}
                strokeWidth={2.5}
                strokeLinejoin="round"
                animationDuration={750}
              />
            ))}
            {activeOptionIndex !== -1 ? (
              <Line
                type="step"
                dot={false}
                dataKey={(data) => data.options[activeOptionIndex].probability}
                stroke={market.options[activeOptionIndex].color}
                strokeWidth={2.5}
                strokeLinejoin="round"
                animationDuration={750}
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      ) : null}
    </Card>
  )
}
