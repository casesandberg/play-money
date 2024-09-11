import { revalidateTag } from 'next/cache'
import { getExtendedMarket } from '@play-money/api-helpers/client'
import { MarketPageLayout } from '@play-money/markets/components/MarketPageLayout'

export default async function AppQuestionsLayout({
  children,
  params,
  searchParams,
}: {
  children: React.ReactNode
  params: { marketId: string }
  searchParams?: { option: string }
}) {
  const market = await getExtendedMarket({ marketId: params.marketId })
  const createdOrderOptions = market.options.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
  const activeOptionId = searchParams?.option || createdOrderOptions[0]?.id || ''

  // eslint-disable-next-line @typescript-eslint/require-await -- Next requires this to be async since its SSR
  const handleRevalidate = async () => {
    'use server'
    revalidateTag(`market:${params.marketId}`)
  }

  return (
    <MarketPageLayout activeOptionId={activeOptionId} market={market} onRevalidate={handleRevalidate}>
      {children}
    </MarketPageLayout>
  )
}
