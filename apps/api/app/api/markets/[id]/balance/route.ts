import { NextResponse } from 'next/server'
import { getAccountBalance } from '@play-money/accounts/lib/getAccountBalance'
import { getAmmAccount } from '@play-money/accounts/lib/getAmmAccount'
import { getUserAccount } from '@play-money/accounts/lib/getUserAccount'
import type { SchemaResponse } from '@play-money/api-helpers'
import { auth } from '@play-money/auth'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const { id } = schema.get.parameters.parse(params)

    const ammAccount = await getAmmAccount({ marketId: id })
    const y = await getAccountBalance(ammAccount.id, 'YES', id, ['MARKET_RESOLVE_LOSS', 'MARKET_RESOLVE_WIN'])
    const n = await getAccountBalance(ammAccount.id, 'NO', id, ['MARKET_RESOLVE_LOSS', 'MARKET_RESOLVE_WIN'])

    let holdings = {}
    const session = await auth()

    if (session?.user?.id) {
      const userAccount = await getUserAccount({ id: session.user.id })
      const yes = await getAccountBalance(userAccount.id, 'YES', id)
      const no = await getAccountBalance(userAccount.id, 'NO', id)

      holdings = {
        YES: yes.toNumber(),
        NO: no.toNumber(),
      }
    }

    return NextResponse.json({
      YES: y.toNumber(),
      NO: n.toNumber(),
      probability: {
        YES: n.div(y.add(n)).toNumber(),
        NO: y.div(y.add(n)).toNumber(),
      },
      holdings,
    })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
