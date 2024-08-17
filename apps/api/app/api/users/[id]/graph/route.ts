import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { getUserPrimaryAccount } from '@play-money/users/lib/getUserPrimaryAccount'
import { getUserTotalTimeSeries } from '@play-money/users/lib/getUserTotalTimeSeries'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.GET.responses>> {
  try {
    const { id } = schema.GET.parameters.parse(params)
    const userAccount = await getUserPrimaryAccount({ userId: id })

    const data = await getUserTotalTimeSeries({
      accountId: userAccount.id,
      tickInterval: 1,
      endAt: new Date(),
      //   excludeTransactionTypes: ['MARKET_BUY', 'MARKET_RESOLVE_WIN', 'MARKET_EXCESS_LIQUIDITY'],
    })

    return NextResponse.json({
      data,
    })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
