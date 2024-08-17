import { NextResponse } from 'next/server'
import { getUserAccount } from '@play-money/accounts/lib/getUserAccount'
import type { SchemaResponse } from '@play-money/api-helpers'
import { auth } from '@play-money/auth'
import { getAssetBalance } from '@play-money/finance/lib/getBalances'
import type schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request): Promise<SchemaResponse<typeof schema.GET.responses>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userAccount = await getUserAccount({ id: session.user.id })
    const primaryBalance = await getAssetBalance({
      accountId: userAccount.id,
      assetType: 'CURRENCY',
      assetId: 'PRIMARY',
    })

    return NextResponse.json({ balance: primaryBalance.amount.toNumber() })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging

    return NextResponse.json({ error: 'Failed to retrieve user session' }, { status: 500 })
  }
}
