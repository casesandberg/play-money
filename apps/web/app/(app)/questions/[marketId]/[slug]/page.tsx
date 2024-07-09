import { revalidatePath, revalidateTag } from 'next/cache'
import { MarketComments } from '@play-money/comments/components/MarketComments'
import db from '@play-money/database'
import type { ExtendedMarket } from '@play-money/markets/components/MarketOverviewPage'
import { MarketOverviewPage } from '@play-money/markets/components/MarketOverviewPage'
import { sanitizeUser } from '@play-money/users/lib/sanitizeUser'

// TODO: @casesandberg Extract to API call
export const getMarket = async ({ id }: { id: string }): Promise<ExtendedMarket> => {
  const market = await db.market.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
      options: true,
      marketResolution: {
        include: {
          resolution: true,
          resolvedBy: true,
        },
      },
    },
  })

  if (!market) {
    throw new Error('Market not found')
  }

  return {
    ...market,
    user: sanitizeUser(market.user),
    options: market.options.map((option) => ({
      ...option,
      color: option.currencyCode === 'YES' ? '#3b82f6' : '#ec4899',
    })),
    marketResolution: market.marketResolution
      ? {
          ...market.marketResolution,
          resolvedBy: sanitizeUser(market.marketResolution.resolvedBy),
          resolution: {
            ...market.marketResolution.resolution,
            color: market.marketResolution.resolution.currencyCode === 'YES' ? '#3b82f6' : '#ec4899',
          },
        }
      : undefined,
  }
}

// TODO: @casesandberg Generate this from OpenAPI schema
async function getExtendedMarket({ marketId }: { marketId: string }): Promise<ExtendedMarket> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/markets/${marketId}?extended=true`, {
    credentials: 'include',
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
