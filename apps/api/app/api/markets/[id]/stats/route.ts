import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { auth } from '@play-money/auth'
import { getMarketStats } from '@play-money/markets/lib/getMarketStats'
import { UserNotFoundError } from '@play-money/users/lib/exceptions'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const session = await auth()

    const { id } = schema.get.parameters.parse(params)
    const { totalLiquidity, lpUserCount, traderBonusPayouts, holdings } = await getMarketStats({
      marketId: id,
      userId: session?.user?.id,
    })

    return NextResponse.json({
      totalLiquidity: totalLiquidity.toNumber(),
      lpUserCount,
      traderBonusPayouts: traderBonusPayouts.toNumber(),
      holdings: {
        traderBonusPayouts: holdings.traderBonusPayouts?.toNumber(),
      },
    })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging

    if (error instanceof UserNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
