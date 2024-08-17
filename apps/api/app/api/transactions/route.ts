import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { getTransactions } from '@play-money/transactions/lib/getTransactions'
import { UserNotFoundError } from '@play-money/users/lib/exceptions'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(req: Request): Promise<SchemaResponse<typeof schema.GET.responses>> {
  try {
    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.search)
    const params = Object.fromEntries(searchParams)

    if (params.transactionType) {
      // TODO: Transform this within zod before parsing. This is a workaround for now.
      params.transactionType = params.transactionType.split(',') as unknown as string
    }

    const { marketId, userId, transactionType } = schema.GET.parameters.parse(params) ?? {}

    const transactions = await getTransactions({ marketId, userId, transactionType })

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
