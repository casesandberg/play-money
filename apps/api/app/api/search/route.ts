import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { search } from '@play-money/search/lib/search'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(req: Request): Promise<SchemaResponse<typeof schema.GET.responses>> {
  try {
    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.search)
    const params = Object.fromEntries(searchParams)

    const { query } = schema.GET.parameters.parse(params)

    const { users } = await search({ query })

    return NextResponse.json({ users })
  } catch (error) {
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
