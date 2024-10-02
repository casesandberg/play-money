'use client'

import { format } from 'date-fns'
import React from 'react'
import { LineChart, ResponsiveContainer, YAxis, XAxis, Tooltip as ChartTooltip, Line } from 'recharts'
import { useTransparencyStatsUsers, useUserGraph } from '@play-money/api-helpers/client/hooks'
import { formatNumber } from '@play-money/finance/lib/formatCurrency'
import { Card } from '@play-money/ui/card'

function CustomizedXAxisTick({ x, y, payload }: { x: number; y: number; payload: { value: string } }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={5} dx={-4} textAnchor="end" className="fill-muted-foreground/50">
        {format(payload.value, 'MMM d')}
      </text>
    </g>
  )
}

function CustomizedYAxisTick({ x, y, payload }: { x: number; y: number; payload: { value: number } }) {
  return payload.value !== 0 ? (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} dx={2} textAnchor="start" className="fill-muted-foreground/50">
        ¤{formatNumber(payload.value)}
      </text>
    </g>
  ) : (
    <g />
  )
}

const DAU_COLOR = '#333'
const SIGNUPS_COLOR = '#7c3aed'
const REFERRALS_COLOR = '#facc15'

export function UserStatsGraph() {
  const { data: graph } = useTransparencyStatsUsers()
  const latestData = graph?.data[graph.data.length - 1]

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-x-4 px-4 pt-4">
        <div className="text-lg font-medium text-muted-foreground">{latestData ? latestData.dau : 0} DAU</div>

        <div className="flex-shrink-0 font-mono text-sm" style={{ color: SIGNUPS_COLOR }}>
          {latestData ? latestData.signups : 0} Signups
        </div>

        <div className="flex-shrink-0 font-mono text-sm" style={{ color: REFERRALS_COLOR }}>
          {latestData ? latestData.referrals : 0} Referrals
        </div>
      </div>
      <div className="h-40">
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
                        <div style={{ color: DAU_COLOR }}>DAU: {data.dau}</div>
                        <div style={{ color: SIGNUPS_COLOR }}>Signups: {data.signups}</div>
                        <div style={{ color: REFERRALS_COLOR }}>Referrals: {data.signups}</div>
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
                width={50}
                stroke="hsl(var(--border))"
                className="font-mono text-[10px] uppercase"
                orientation="right"
                tick={CustomizedYAxisTick}
                tickFormatter={(value, i) => (value !== 0 && value !== 100 ? `${value}%` : '')}
              />

              <Line
                type="step"
                dataKey="dau"
                dot={false}
                stroke={DAU_COLOR}
                strokeWidth={2}
                strokeLinejoin="round"
                animationDuration={750}
              />
              <Line
                type="step"
                dataKey="signups"
                dot={false}
                stroke={SIGNUPS_COLOR}
                strokeWidth={2}
                strokeLinejoin="round"
                animationDuration={750}
              />
              <Line
                type="step"
                dataKey="referrals"
                dot={false}
                stroke={REFERRALS_COLOR}
                strokeWidth={2}
                strokeLinejoin="round"
                animationDuration={750}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </Card>
  )
}
