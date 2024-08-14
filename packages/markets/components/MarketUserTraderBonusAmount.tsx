'use client'

import useSWR from 'swr'
import { CurrencyDisplay } from '@play-money/currencies/components/CurrencyDisplay'
import { MarketStats } from './LiquidityBoostDialog'

export function MarketUserTraderBonusAmount({ marketId }: { marketId: string }) {
  const { data: stats } = useSWR<MarketStats>(`/v1/markets/${marketId}/stats`)

  if (stats?.earnings.traderBonusPayouts) {
    return <CurrencyDisplay value={stats.earnings.traderBonusPayouts} />
  }

  return stats?.traderBonusPayouts ? <CurrencyDisplay value={stats.traderBonusPayouts} /> : '—'
}
