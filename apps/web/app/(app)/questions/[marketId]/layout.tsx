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
  const activeOptionId = searchParams?.option || market.options[0]?.id || ''

  return (
    <MarketPageLayout activeOptionId={activeOptionId} market={market}>
      {children}
    </MarketPageLayout>
  )
}
