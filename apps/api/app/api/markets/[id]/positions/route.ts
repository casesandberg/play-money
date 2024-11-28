import Decimal from 'decimal.js'
import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { getAuthUser } from '@play-money/auth/lib/getAuthUser'
import db from '@play-money/database'
import type { NetBalance } from '@play-money/finance/lib/getBalances'
import { transformMarketBalancesToNumbers } from '@play-money/finance/lib/getBalances'
import { getUserPrimaryAccount } from '@play-money/users/lib/getUserPrimaryAccount'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const { id } = schema.get.parameters.parse(params)
    const userId = await getAuthUser(req)
    const userAccount = userId ? await getUserPrimaryAccount({ userId }) : undefined

    const [userBalances, userBalancesInMarket] = await Promise.all([
      db.balance.findMany({
        where: {
          marketId: id,
          assetType: 'CURRENCY',
          assetId: 'PRIMARY',
          account: {
            NOT: {
              userPrimary: null,
            },
          },
          total: {
            gt: new Decimal(0),
          },
        },
        orderBy: {
          total: 'desc',
        },
        include: {
          account: {
            include: {
              userPrimary: true,
            },
          },
        },
        take: 5,
      }) as unknown as Array<NetBalance>,
      userAccount
        ? (db.balance.findFirst({
            where: {
              accountId: userAccount.id,
              assetType: 'CURRENCY',
              assetId: 'PRIMARY',
              marketId: id,
            },
            include: {
              account: {
                include: {
                  userPrimary: true,
                },
              },
            },
          }) as unknown as NetBalance | undefined)
        : undefined,
    ])

    return NextResponse.json({
      balances: transformMarketBalancesToNumbers(userBalances),
      user: userBalancesInMarket ? transformMarketBalancesToNumbers([userBalancesInMarket])[0] : undefined,
    })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
