'use client'

import useSWR from 'swr'
import { MarketStats } from './LiquidityBoostDialog'

export function MarketUserTraderBonusAmount({ marketId }: { marketId: string }) {
  const { data: stats } = useSWR<MarketStats>(`/v1/markets/${marketId}/stats`)

  if (stats?.earnings.traderBonusPayouts) {
    return `$${Math.round(stats.earnings.traderBonusPayouts)}`
  }

  return stats?.traderBonusPayouts ? `$${Math.round(stats.traderBonusPayouts)}` : '—'
}
