import React from 'react'
import { getMarkets } from '@play-money/api-helpers/client'
import { MarketList } from '@play-money/markets/components/MarketList'

export default async function AppQuestionsPage() {
  const { markets } = await getMarkets()

  return (
    <div className="mx-auto flex max-w-screen-lg flex-1 flex-col gap-8 md:flex-row">
      <MarketList markets={markets} />
    </div>
  )
}
