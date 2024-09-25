import Decimal from 'decimal.js'
import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { auth } from '@play-money/auth'
import db from '@play-money/database'
import { getList } from '@play-money/lists/lib/getList'
import { canAddToList } from '@play-money/lists/rules'
import { createMarket } from '@play-money/markets/lib/createMarket'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.post.responses>> {
  try {
    const { id } = schema.post.parameters.parse(params)

    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'You must be signed in to create a market' }, { status: 401 })
    }

    const body = (await req.json()) as unknown
    const basicMarket = schema.post.requestBody.parse(body)

    const list = await getList({ id })

    if (!canAddToList({ list, userId: session.user.id })) {
      throw new Error('Cannot add to list')
    }

    const newMarket = await createMarket({
      ...basicMarket,
      createdBy: session.user.id,
      parentListId: list.id,
      subsidyAmount: new Decimal(100),
    })

    await db.list.update({
      where: {
        id: list.id,
      },
      data: {
        markets: {
          connectOrCreate: [
            {
              where: {
                listId_marketId: {
                  listId: list.id,
                  marketId: newMarket.id,
                },
              },
              create: {
                marketId: newMarket.id,
              },
            },
          ],
        },
      },
    })

    return NextResponse.json({ market: newMarket })
  } catch (error: unknown) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Failed to create market' }, { status: 500 })
  }
}
