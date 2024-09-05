import React from 'react'
import { getMarkets } from '@play-money/api-helpers/client'
import { MarketsTable } from '@play-money/markets/components/MarketsTable'

export default async function AppQuestionsPage({
  searchParams,
}: {
  searchParams: { pageSize?: string; page?: string; sort?: string; status?: string; tag?: string }
}) {
  const { markets, totalPages } = await getMarkets({
    pageSize: searchParams.pageSize,
    page: searchParams.page,
    sortField: searchParams.sort?.split('-')[0],
    sortDirection: searchParams.sort?.split('-')[1],
    status: searchParams.status,
    tag: searchParams.tag,
  })

  return (
    <div className="mx-auto flex max-w-screen-lg flex-1 flex-col gap-8 md:flex-row">
      <MarketsTable data={markets} totalPages={totalPages} />
    </div>
  )
}
