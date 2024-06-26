import { NextResponse } from 'next/server'
import { getAccountBalance } from '@play-money/accounts/lib/getAccountBalance'
import { getUserAccount } from '@play-money/accounts/lib/getUserAccount'
import type { SchemaResponse } from '@play-money/api-helpers'
import { auth } from '@play-money/auth'
import type schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request): Promise<SchemaResponse<typeof schema.GET.responses>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userAccount = await getUserAccount({ id: session.user.id })
    const balance = await getAccountBalance(userAccount.id, 'PRIMARY')

    return NextResponse.json({ balance: balance.toNumber() })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve user session' }, { status: 500 })
  }
}
