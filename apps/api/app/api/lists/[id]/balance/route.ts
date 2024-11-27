import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { auth } from '@play-money/auth'
import db from '@play-money/database'
import {
  getListBalances,
  transformMarketBalancesToNumbers,
  transformMarketOptionPositionToNumbers,
} from '@play-money/finance/lib/getBalances'
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
    const userAccount = session?.user?.id ? await getUserPrimaryAccount({ userId: session.user.id }) : undefined

    const list = await db.list.findUnique({
      where: { id },
      include: {
        markets: true,
      },
    })

    const [userBalancesInList, userPositions] = await Promise.all([
      userAccount ? getListBalances({ accountId: userAccount.id, listId: id }) : undefined,
      userAccount
        ? db.marketOptionPosition.findMany({
            where: {
              marketId: {
                in: list?.markets.map((m) => m.marketId),
              },
              accountId: userAccount.id,
            },
          })
        : undefined,
    ])

    return NextResponse.json({
      user: transformMarketBalancesToNumbers(userBalancesInList),
      userPositions: transformMarketOptionPositionToNumbers(userPositions),
    })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
