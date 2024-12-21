import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { getLists } from '@play-money/lists/lib/getLists'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(req: Request): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.search)
    const params = Object.fromEntries(searchParams)

    const { pageSize = 50, ownerId } = schema.get.parameters.parse(params) ?? {}

    const { lists, total } = await getLists({ ownerId }, undefined, {
      skip: (1 - 1) * pageSize,
      take: pageSize,
    })

    return NextResponse.json({
      lists,
      page: 1,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
