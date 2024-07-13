'use client'

import useSWR from 'swr'
import { MarketStats } from './LiquidityBoostDialog'

export function MarketUserTraderBonusAmount({ marketId }: { marketId: string }) {
  const { data: stats } = useSWR<MarketStats>(`/v1/markets/${marketId}/stats`)

  return stats?.holdings?.traderBonusPayouts ? `$${Math.round(stats.holdings.traderBonusPayouts)}` : '—'
}
