import { NextResponse } from 'next/server'
import { getAccountBalance } from '@play-money/accounts/lib/getAccountBalance'
import { getAmmAccount } from '@play-money/accounts/lib/getAmmAccount'
import type { SchemaResponse } from '@play-money/api-helpers'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const { id } = schema.get.parameters.parse(params)

    const ammAccount = await getAmmAccount({ marketId: id })
    const y = await getAccountBalance(ammAccount.id, 'YES')
    const n = await getAccountBalance(ammAccount.id, 'NO')

    return NextResponse.json({
      YES: y.toNumber(),
      NO: n.toNumber(),
      probability: {
        YES: n.div(y.add(n)).toNumber(),
        NO: y.div(y.add(n)).toNumber(),
      },
    })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
