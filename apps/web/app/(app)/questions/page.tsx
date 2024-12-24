import React from 'react'
import { getMarkets } from '@play-money/api-helpers/client'
import { MarketsTable } from '@play-money/markets/components/MarketsTable'

export default async function AppQuestionsPage({
  searchParams,
}: {
  searchParams: { limit?: string; cursor?: string; sort?: string; status?: string; tag?: string }
}) {
  const { data: markets, pageInfo } = await getMarkets({
    limit: searchParams.limit ? Number(searchParams.limit) : undefined,
    cursor: searchParams.cursor,
    sortField: searchParams.sort?.split('-')[0],
    sortDirection: searchParams.sort?.split('-')[1] as 'asc' | 'desc',
    status: searchParams.status,
    tags: searchParams.tag ? [searchParams.tag] : undefined,
  })

  return (
    <div className="mx-auto flex max-w-screen-lg flex-1 flex-col gap-8 md:flex-row">
      <MarketsTable data={markets} pageInfo={pageInfo} />
    </div>
  )
}
