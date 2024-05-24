import { MarketPositionsPage } from '@play-money/markets/components/MarketPositionsPage'
import { getMarket } from '../page'

export default async function AppPostsSlugPage({ params }: { params: { marketId: string } }) {
  const market = await getMarket({ id: params.marketId })
  return <MarketPositionsPage market={market} />
}
