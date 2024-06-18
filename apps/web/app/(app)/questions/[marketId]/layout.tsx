import { MarketPageLayout } from '@play-money/markets/components/MarketPageLayout'
import { getMarket } from './[slug]/page'

export default async function AppQuestionsLayout({
  children,
  params,
  searchParams,
}: {
  children: React.ReactNode
  params: { marketId: string }
  searchParams?: { option: string }
}) {
  const market = await getMarket({ id: params.marketId })
  const activeOptionId = searchParams?.option || market.options[0]?.id || ''

  return (
    <MarketPageLayout activeOptionId={activeOptionId} market={market}>
      {children}
    </MarketPageLayout>
  )
}
