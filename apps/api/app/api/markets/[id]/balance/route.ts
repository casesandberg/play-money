import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { auth } from '@play-money/auth'
import { getMarketBalance } from '@play-money/markets/lib/getMarketBalance'
import { getUserBalanceInMarket } from '@play-money/markets/lib/getUserBalanceInMarket'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const { id } = schema.get.parameters.parse(params)
    const session = await auth()

    const [balance, holdings] = await Promise.all([
      getMarketBalance({
        marketId: id,
        excludeTransactionTypes: ['MARKET_RESOLVE_LOSS', 'MARKET_RESOLVE_WIN'],
      }),
      session?.user?.id ? getUserBalanceInMarket({ userId: session.user.id, marketId: id }) : {},
    ])

    return NextResponse.json({ ...balance, holdings })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
