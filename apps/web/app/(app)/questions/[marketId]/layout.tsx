import { revalidateTag } from 'next/cache'
import { getExtendedMarket } from '@play-money/api-helpers/client'
import { MarketPageLayout } from '@play-money/markets/components/MarketPageLayout'

export default async function AppQuestionsLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { marketId: string }
}) {
  const { data: market } = await getExtendedMarket({ marketId: params.marketId })

  // eslint-disable-next-line @typescript-eslint/require-await -- Next requires this to be async since its SSR
  const handleRevalidate = async () => {
    'use server'
    revalidateTag(`market:${params.marketId}`)
  }

  return (
    <MarketPageLayout market={market} onRevalidate={handleRevalidate}>
      {children}
    </MarketPageLayout>
  )
}
