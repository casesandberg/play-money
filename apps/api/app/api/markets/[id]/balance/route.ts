import { NextResponse } from 'next/server'
import { getAmmAccount } from '@play-money/accounts/lib/getAmmAccount'
import type { SchemaResponse } from '@play-money/api-helpers'
import { auth } from '@play-money/auth'
import { getBalances, transformBalancesToNumbers } from '@play-money/finance/lib/getBalances'
import { getUserPrimaryAccount } from '@play-money/finance/lib/getUserPrimaryAccount'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const { id } = schema.get.parameters.parse(params)
    const session = await auth()
    const ammAccount = await getAmmAccount({ marketId: id })
    const userAccount = session?.user?.id ? await getUserPrimaryAccount({ userId: session.user.id }) : undefined

    const [ammBalances, userBalancesInMarket] = await Promise.all([
      getBalances({ accountId: ammAccount.id, marketId: id }),
      userAccount ? getBalances({ accountId: userAccount.id, marketId: id }) : undefined,
    ])

    return NextResponse.json({
      amm: transformBalancesToNumbers(ammBalances),
      user: transformBalancesToNumbers(userBalancesInMarket),
    })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
