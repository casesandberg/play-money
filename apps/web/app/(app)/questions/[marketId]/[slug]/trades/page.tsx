import { MarketPositionsPage } from '@play-money/markets/components/MarketPositionsPage'
import type { TransactionWithItems } from '@play-money/transactions/lib/getTransactions'
import { getExtendedMarket } from '../page'

// TODO: @casesandberg Generate this from OpenAPI schema
export async function getMarketTransactions({
  marketId,
}: {
  marketId: string
}): Promise<{ transactions: Array<TransactionWithItems> }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/transactions?marketId=${marketId}&transactionType=MARKET_BUY,MARKET_SELL`,
    {
      credentials: 'include',
    }
  )
  if (!res.ok) {
    throw new Error('There was an error fetching data')
  }

  return res.json() as Promise<{ transactions: Array<TransactionWithItems> }>
}

export default async function AppPostsSlugPage({ params }: { params: { marketId: string } }) {
  const market = await getExtendedMarket({ marketId: params.marketId })
  const { transactions = [] } = await getMarketTransactions({ marketId: params.marketId })

  return <MarketPositionsPage market={market} transactions={transactions} />
}
