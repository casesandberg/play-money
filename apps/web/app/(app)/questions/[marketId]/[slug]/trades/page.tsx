import { getExtendedMarket, getMarketTransactions } from '@play-money/api-helpers/client'
import { MarketTradesPage } from '@play-money/markets/components/MarketTradesPage'

export default async function AppPostsSlugPage({
  params,
  searchParams,
}: {
  params: { marketId: string }
  searchParams: { limit?: string; cursor?: string }
}) {
  const market = await getExtendedMarket({ marketId: params.marketId })
  const { data: transactions = [], pageInfo } = await getMarketTransactions({
    marketId: params.marketId,
    limit: searchParams.limit ? Number(searchParams.limit) : undefined,
    cursor: searchParams.cursor,
  })

  return <MarketTradesPage market={market} pageInfo={pageInfo} transactions={transactions} />
}
