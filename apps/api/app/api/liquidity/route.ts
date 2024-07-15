import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { getNewLiquidityTransactions } from '@play-money/markets/lib/getNewLiquidityTransactions'
import { UserNotFoundError } from '@play-money/users/lib/exceptions'
import type schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const transactions = await getNewLiquidityTransactions()

    return NextResponse.json({
      transactions,
    })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging

    if (error instanceof UserNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
