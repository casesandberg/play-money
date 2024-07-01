'use client'

import React from 'react'
import useSWR from 'swr'
import { ExtendedMarket } from './MarketOverviewPage'

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

  for (const item of data) {
    if (item.endAt <= oneWeekAgo) {
      oneWeekAgoProbability = item.probability
      break
    }
  }

  return {
    latestProbability,
    difference: latestProbability - oneWeekAgoProbability,
  }
}

export function MarketLikelyOption({ market }: { market: ExtendedMarket }) {
  const { data: balance } = useSWR(`/v1/markets/${market.id}/balance`, { refreshInterval: 1000 * 60 }) // 60 seconds
  const { data: graph } = useSWR(`/v1/markets/${market.id}/graph`, { refreshInterval: 1000 * 60 * 5 }) // 5 mins

  const mostLikelyProbability = Math.max(
    ...market.options.map((option) => balance?.probability[option.currencyCode] || 0)
  )
  const mostLikelyOption = market.options.find(
    (option) => balance?.probability[option.currencyCode] === mostLikelyProbability
  )
  const change = getProbabilityChange(graph?.data || [])

  return mostLikelyOption ? (
    <>
      <div style={{ color: mostLikelyOption.color }} className="font-medium">
        {Math.round(mostLikelyProbability * 100)}% {mostLikelyOption.name}
      </div>

      {change.difference !== 0 ? (
        <div>
          {change.difference > 0 ? '+' : ''}
          {Math.round(change.difference * 100)}% this week
        </div>
      ) : null}
    </>
  ) : null
}
