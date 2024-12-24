import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { getTransactions } from '@play-money/finance/lib/getTransactions'
import { UserNotFoundError } from '@play-money/users/lib/exceptions'
import { getUserById } from '@play-money/users/lib/getUserById'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const { id } = schema.get.parameters.parse(params)

    await getUserById({ id })

    const results = await getTransactions({
      userId: id,
      transactionType: ['TRADE_BUY', 'TRADE_SELL'],
      isReverse: null,
    })

    return NextResponse.json(results)
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging

    if (error instanceof UserNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
