import { revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'
import { MarketComments } from '@play-money/markets/components/MarketComments'
import type { ExtendedMarket } from '@play-money/markets/components/MarketOverviewPage'
import { MarketOverviewPage } from '@play-money/markets/components/MarketOverviewPage'

// TODO: @casesandberg Generate this from OpenAPI schema
export async function getExtendedMarket({ marketId }: { marketId: string }): Promise<ExtendedMarket> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/markets/${marketId}?extended=true`, {
    headers: { Cookie: cookies().toString() },
    next: { tags: [`market:${marketId}`] },
  })
  return response.json() as Promise<ExtendedMarket>
}

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
      renderComments={<MarketComments marketId={market.id} />}
    />
  )
}
