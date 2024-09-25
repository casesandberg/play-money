import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { auth } from '@play-money/auth'
import { createList } from '@play-money/lists/lib/createList'
import { createMarket } from '@play-money/markets/lib/createMarket'
import { getMarkets } from '@play-money/markets/lib/getMarkets'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(req: Request): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.search)
    const params = Object.fromEntries(searchParams)

    const {
      status = 'active',
      createdBy,
      pageSize = 50,
      page = 1,
      tag,
      sortField,
      sortDirection = 'desc',
    } = schema.get.parameters.parse(params) ?? {}

    const { markets, total } = await getMarkets(
      { createdBy, tag, status },
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
      markets,
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

export async function POST(req: Request): Promise<SchemaResponse<typeof schema.post.responses>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'You must be signed in to create a market' }, { status: 401 })
    }

    const body = (await req.json()) as unknown
    const basicMarket = schema.post.requestBody.parse(body)

    if (basicMarket.type === 'binary' || basicMarket.type === 'multi') {
      const newMarket = await createMarket({
        ...basicMarket,
        createdBy: session.user.id,
      })
      return NextResponse.json({ market: newMarket })
    } else if (basicMarket.type === 'list') {
      const newList = await createList({
        ...basicMarket,
        ownerId: session.user.id,
        title: basicMarket.question,
        markets: basicMarket.options,
      })
      return NextResponse.json({ list: newList })
    }

    return NextResponse.json({})
  } catch (error: unknown) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Failed to create market' }, { status: 500 })
  }
}
