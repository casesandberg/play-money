import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { auth } from '@play-money/auth'
import db from '@play-money/database'
import {
  getMarketBalances,
  transformMarketBalancesToNumbers,
  transformMarketOptionPositionToNumbers,
} from '@play-money/finance/lib/getBalances'
import { getMarketAmmAccount } from '@play-money/markets/lib/getMarketAmmAccount'
import { getUserPrimaryAccount } from '@play-money/users/lib/getUserPrimaryAccount'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const { id } = schema.get.parameters.parse(params)
    const session = await auth()
    const ammAccount = await getMarketAmmAccount({ marketId: id })
    const userAccount = session?.user?.id ? await getUserPrimaryAccount({ userId: session.user.id }) : undefined

    const [ammBalances, userBalancesInMarket, userPositions] = await Promise.all([
      getMarketBalances({ accountId: ammAccount.id, marketId: id }),
      userAccount ? getMarketBalances({ accountId: userAccount.id, marketId: id }) : undefined,
      userAccount
        ? db.marketOptionPosition.findMany({ where: { marketId: id, accountId: userAccount.id } })
        : undefined,
    ])

    return NextResponse.json({
      amm: transformMarketBalancesToNumbers(ammBalances),
      user: transformMarketBalancesToNumbers(userBalancesInMarket),
      userPositions: transformMarketOptionPositionToNumbers(userPositions),
    })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
