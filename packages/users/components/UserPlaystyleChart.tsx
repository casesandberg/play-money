'use client'

import React, { useState } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Sector, Legend, ResponsiveContainer } from 'recharts'

type DataPoint = {
  subject: string
  value: number
}

function customTick({
  payload,
  x,
  y,
  textAnchor,
  stroke,
  radius,
}: React.SVGProps<SVGTextElement> & { payload: DataPoint }) {
  return (
    <g>
      <text
        radius={radius}
        stroke={stroke}
        x={x}
        y={y}
        className="fill-muted-foreground font-mono text-xs uppercase opacity-0"
        text-anchor={textAnchor}
      >
        <tspan x={x} dy="0em">
          {payload.value}
        </tspan>
      </text>
    </g>
  )
}

export function UserPlaystyleChart({ data }: { data: Array<{ subject: string; value: number; color: string }> }) {
  const [size, setSize] = useState(300)
  const dataMax = 4

  const radius = size / 2
  const x = size
  const wedgeSize = 180 / data.length
  const startAngle = 180 - wedgeSize / 2
  const endAngle = 0 - wedgeSize / 2

  const scaleFactor = radius / dataMax
  return (
    <ResponsiveContainer onResize={setSize} height={size / 2}>
      <RadarChart
        width={x}
        height={radius}
        cx={x / 2}
        cy={radius + 1}
        outerRadius={radius}
        data={data}
        startAngle={startAngle}
        endAngle={endAngle}
      >
        <PolarGrid gridType="circle" className="stroke-border" />
        <PolarAngleAxis dataKey="subject" tick={customTick} />
        <PolarRadiusAxis angle={0} domain={[0, 1000]} />
        <g>
          {data.map((entry, index) => {
            const startAngle = 180 - index * wedgeSize
            const endAngle = 180 - (index + 1) * wedgeSize
            const outerRadius = entry.value * scaleFactor
            return (
              <Sector
                key={entry.subject}
                cx={x / 2}
                cy={radius}
                innerRadius={0}
                outerRadius={outerRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                stroke={entry.color}
                fillOpacity={0.8}
                fill={entry.color}
              />
            )
          })}
        </g>
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  )
}
