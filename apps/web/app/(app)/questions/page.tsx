import React from 'react'
import { MarketList } from '@play-money/markets/components/MarketList'
import type { ExtendedMarket } from '@play-money/markets/components/MarketOverviewPage'
import { RecentTrades } from '@play-money/transactions/components/RecentTrades'

export async function getMarkets(): Promise<{ markets: Array<ExtendedMarket> }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/markets`, {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error('There was an error fetching data')
  }

  return res.json() as unknown as { markets: Array<ExtendedMarket> }
}

export default async function AppQuestionsPage() {
  const { markets } = await getMarkets()

  return (
    <div className="mx-auto flex max-w-screen-lg flex-1 flex-col gap-8 md:flex-row">
      <MarketList markets={markets} />

      <div className="md:w-80">
        <div className="pb-2 text-xs font-semibold uppercase text-muted-foreground">Recent trades</div>
        <RecentTrades />
      </div>
    </div>
  )
}
