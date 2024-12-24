import React from 'react'
import { getMarkets } from '@play-money/api-helpers/client'
import { MarketList } from '@play-money/markets/components/MarketList'

export default async function AppQuestionsPage({ params }: { params: { tag: string } }) {
  const { data: markets } = await getMarkets({ tags: [params.tag] })

  return (
    <div className="mx-auto flex max-w-screen-lg flex-1 flex-col gap-8 md:flex-row">
      <div className="w-full">
        <div className="mb-2 text-2xl font-semibold">{params.tag}</div>
        <MarketList markets={markets} />
      </div>

      <div className="space-y-8 md:w-80" />
    </div>
  )
}
