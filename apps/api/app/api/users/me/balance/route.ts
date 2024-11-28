import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { getAuthUser } from '@play-money/auth/lib/getAuthUser'
import { getBalance } from '@play-money/finance/lib/getBalances'
import { getUserPrimaryAccount } from '@play-money/users/lib/getUserPrimaryAccount'
import type schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(req: Request): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const userId = await getAuthUser(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userAccount = await getUserPrimaryAccount({ userId })
    const primaryBalance = await getBalance({
      accountId: userAccount.id,
      assetType: 'CURRENCY',
      assetId: 'PRIMARY',
    })

    return NextResponse.json({ balance: primaryBalance.total.toNumber() })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging

    return NextResponse.json({ error: 'Failed to retrieve user session' }, { status: 500 })
  }
}
