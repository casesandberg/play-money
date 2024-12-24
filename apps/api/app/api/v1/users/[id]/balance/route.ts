import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { getBalance, transformMarketBalancesToNumbers } from '@play-money/finance/lib/getBalances'
import { getUserPrimaryAccount } from '@play-money/users/lib/getUserPrimaryAccount'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const { id } = schema.get.parameters.parse(params)
    const userAccount = await getUserPrimaryAccount({ userId: id })
    const balance = await getBalance({ accountId: userAccount.id, assetType: 'CURRENCY', assetId: 'PRIMARY' })

    return NextResponse.json({
      data: {
        balance: transformMarketBalancesToNumbers([balance])[0],
      },
    })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
