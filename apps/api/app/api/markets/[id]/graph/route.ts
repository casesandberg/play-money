import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { getMarket } from '@play-money/markets/lib/getMarket'
import { getMarketTransactionsTimeSeries } from '@play-money/markets/lib/getMarketTransactionsTimeSeries'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.get.flatResponses>> {
  try {
    const { id } = schema.get.parameters.parse(params)
    const market = await getMarket({ id })

    const data = await getMarketTransactionsTimeSeries({
      marketId: id,
      tickInterval: 1,
      endAt: market.resolvedAt || new Date(),
      excludeTransactionTypes: ['TRADE_LOSS', 'TRADE_WIN', 'LIQUIDITY_RETURNED'],
    })

    return NextResponse.json({
      data,
    })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
