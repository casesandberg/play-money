import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { getMarketTransactionsTimeSeries } from '@play-money/transactions/lib/getMarketTransactionsTimeSeries'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.GET.responses>> {
  try {
    const { id } = schema.GET.parameters.parse(params)

    const data = await getMarketTransactionsTimeSeries({ marketId: id, tickInterval: 1 })

    return NextResponse.json({
      data,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
