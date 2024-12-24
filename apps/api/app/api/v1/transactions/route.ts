import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { getTransactions } from '@play-money/finance/lib/getTransactions'
import { UserNotFoundError } from '@play-money/users/lib/exceptions'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(req: Request): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.search)
    const params = Object.fromEntries(searchParams)

    if (params.transactionType) {
      // TODO: Transform this within zod before parsing. This is a workaround for now.
      params.transactionType = params.transactionType.split(',') as unknown as string
    }

    const { marketId, userId, transactionType, ...paginationParams } = schema.get.parameters.parse(params) ?? {}

    const results = await getTransactions({ marketId, userId, transactionType }, paginationParams)

    return NextResponse.json(results)
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging

    if (error instanceof UserNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
