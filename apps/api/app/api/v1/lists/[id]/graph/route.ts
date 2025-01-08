import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { getList } from '@play-money/lists/lib/getList'
import { getListTransactionsTimeSeries } from '@play-money/lists/lib/getListTransactionsTimeSeries'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const { id } = schema.get.parameters.parse(params)
    await getList({ id })

    const data = await getListTransactionsTimeSeries({
      listId: id,
      tickInterval: 1,
      endAt: new Date(),
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
