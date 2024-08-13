'use client'

import React from 'react'
import useSWR from 'swr'
import { NetBalanceAsNumbers } from '@play-money/finance/lib/getBalances'
import { marketOptionBalancesToProbabilities } from '@play-money/finance/lib/helpers'
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
  const { data: balance } = useSWR<{ amm: Array<NetBalanceAsNumbers>; user: Array<NetBalanceAsNumbers> }>(
    `/v1/markets/${market.id}/balance`,
    { refreshInterval: 1000 * 60 }
  ) // 60 seconds
  const { data: graph } = useSWR(`/v1/markets/${market.id}/graph`, { refreshInterval: 1000 * 60 * 5 }) // 5 mins

  const probabilities = marketOptionBalancesToProbabilities(balance?.amm)
  const mostLikelyOptionId = Object.entries(probabilities).length
    ? Object.entries(probabilities).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
    : undefined
  const mostLikelyOption = market.options.find((option) => option.id === mostLikelyOptionId)

  const change = getProbabilityChange(graph?.data || [])

  return mostLikelyOptionId && mostLikelyOption ? (
    <>
      <div style={{ color: mostLikelyOption.color }} className="flex-shrink-0 font-medium">
        {probabilities[mostLikelyOptionId]}% {mostLikelyOption.name}
      </div>

      {change.difference !== 0 ? (
        <div className="flex-shrink-0">
          {change.difference > 0 ? '+' : ''}
          {Math.round(change.difference * 100)}% this week
        </div>
      ) : null}
    </>
  ) : null
}
