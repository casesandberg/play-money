import React from 'react'
import { getMarkets } from '@play-money/api-helpers/client'
import { RecentLiquidity } from '@play-money/finance/components/RecentLiquidity'
import { RecentTrades } from '@play-money/finance/components/RecentTrades'
import { MarketList } from '@play-money/markets/components/MarketList'
import { UserQuestCard } from '@play-money/quests/components/UserQuestCard'

export default async function AppPage() {
  const { markets } = await getMarkets()

  return (
    <div className="mx-auto flex max-w-screen-lg flex-1 flex-col gap-8 md:flex-row">
      <MarketList markets={markets} />

      <div className="space-y-8 md:w-80">
        <UserQuestCard />
        <div>
          <div className="pb-2 text-xs font-semibold uppercase text-muted-foreground">Recent trades</div>
          <RecentTrades />
        </div>

        <div>
          <div className="pb-2 text-xs font-semibold uppercase text-muted-foreground">New liquidity</div>
          <RecentLiquidity />
        </div>
      </div>
    </div>
  )
}
