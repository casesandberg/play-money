import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { auth } from '@play-money/auth'
import { cancelMarket } from '@play-money/markets/lib/cancelMarket'
import { getMarket } from '@play-money/markets/lib/getMarket'
import { canModifyMarket } from '@play-money/markets/rules'
import { getUserById } from '@play-money/users/lib/getUserById'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.post.responses>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = schema.post.parameters.parse(params)

    const body = (await req.json()) as unknown
    const { reason } = schema.post.requestBody.parse(body)

    const market = await getMarket({ id, extended: true })
    const cancelingUser = await getUserById({ id: session.user.id })

    if (!canModifyMarket({ market, user: cancelingUser })) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await cancelMarket({
      canceledById: session.user.id,
      marketId: id,
      reason,
    })

    return NextResponse.json({})
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
