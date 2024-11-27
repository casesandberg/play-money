import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { search } from '@play-money/search/lib/search'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(req: Request): Promise<SchemaResponse<typeof schema.get.flatResponses>> {
  try {
    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.search)
    const params = Object.fromEntries(searchParams)

    const { query } = schema.get.parameters.parse(params)

    const { users, markets, lists } = await search({ query })

    return NextResponse.json({ users, markets, lists })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
