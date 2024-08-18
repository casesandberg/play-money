import { getExtendedMarket, getMarketTransactions } from '@play-money/api-helpers/client'
import { MarketPositionsPage } from '@play-money/markets/components/MarketPositionsPage'

export default async function AppPostsSlugPage({ params }: { params: { marketId: string } }) {
  const market = await getExtendedMarket({ marketId: params.marketId })
  const { transactions = [] } = await getMarketTransactions({ marketId: params.marketId })

  return <MarketPositionsPage market={market} transactions={transactions} />
}
