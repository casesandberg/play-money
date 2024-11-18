import { getExtendedMarket, getMarketTransactions } from '@play-money/api-helpers/client'
import { MarketTradesPage } from '@play-money/markets/components/MarketTradesPage'

export default async function AppPostsSlugPage({
  params,
  searchParams,
}: {
  params: { marketId: string }
  searchParams: { pageSize?: string; page?: string }
}) {
  const market = await getExtendedMarket({ marketId: params.marketId })
  const { transactions = [], totalPages } = await getMarketTransactions({
    marketId: params.marketId,
    pageSize: searchParams.pageSize,
    page: searchParams.page,
  })

  return <MarketTradesPage market={market} totalPages={totalPages} transactions={transactions} />
}
