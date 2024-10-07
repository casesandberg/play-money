import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { getMarketPositions } from '@play-money/markets/lib/getMarketPositions'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(req: Request): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.search)
    const params = Object.fromEntries(searchParams)

    const {
      ownerId,
      status,
      pageSize = 50,
      page = 1,
      sortField,
      sortDirection = 'desc',
    } = schema.get.parameters.parse(params) ?? {}

    const { marketPositions, total } = await getMarketPositions(
      { ownerId, status },
      sortField
        ? {
            field: sortField,
            direction: sortDirection,
          }
        : undefined,
      {
        skip: (page - 1) * pageSize,
        take: pageSize,
      }
    )

    return NextResponse.json({
      marketPositions,
      page,
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
