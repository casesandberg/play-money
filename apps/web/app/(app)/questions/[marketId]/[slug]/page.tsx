import { revalidateTag } from 'next/cache'
import { getExtendedMarket } from '@play-money/api-helpers/client'
import { MarketActivity } from '@play-money/markets/components/MarketActivity'
import { MarketOverviewPage } from '@play-money/markets/components/MarketOverviewPage'

export default async function AppPostsSlugPage({ params }: { params: { marketId: string } }) {
  const market = await getExtendedMarket({ marketId: params.marketId })

  // eslint-disable-next-line @typescript-eslint/require-await -- Next requires this to be async since its SSR
  const handleRevalidate = async () => {
    'use server'
    revalidateTag(`market:${params.marketId}`)
  }

  return (
    <MarketOverviewPage
      market={market}
      onRevalidate={handleRevalidate}
      renderActivitiy={<MarketActivity marketId={market.id} />}
    />
  )
}
