import { format } from 'date-fns'
import _ from 'lodash'
import React from 'react'
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip as ChartTooltip } from 'recharts'
import { useMarketGraph } from '@play-money/api-helpers/client/hooks'
import { Card } from '@play-money/ui/card'
import { ExtendedMarket } from '../types'

export function MarketGraph({ market, activeOptionId }: { market: ExtendedMarket; activeOptionId: string }) {
  const { data: graph } = useMarketGraph({ marketId: market.id })
  const activeOptionIndex = market.options.findIndex((o) => o.id === activeOptionId)

  return (
    <Card className="h-32 p-4">
      {graph?.data ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart width={300} height={128} data={graph.data}>
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
            <YAxis type="number" domain={[0, 100]} hide />
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
