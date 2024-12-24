import { NextResponse } from 'next/server'
import { stripUndefined, type SchemaResponse } from '@play-money/api-helpers'
import { getAuthUser } from '@play-money/auth/lib/getAuthUser'
import { CommentNotFoundError } from '@play-money/comments/lib/exceptions'
import { getMarket } from '@play-money/markets/lib/getMarket'
import { updateMarketOption } from '@play-money/markets/lib/updateMarketOption'
import { canModifyMarket } from '@play-money/markets/rules'
import { getUserById } from '@play-money/users/lib/getUserById'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.patch.responses>> {
  try {
    const userId = await getAuthUser(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, optionId } = schema.patch.parameters.parse(params)
    const body = (await req.json()) as unknown
    const { name, color } = schema.patch.requestBody.transform(stripUndefined).parse(body)

    const market = await getMarket({ id })
    const user = await getUserById({ id: userId })

    if (!canModifyMarket({ market, user })) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updatedComment = await updateMarketOption({ id: optionId, name, color })

    return NextResponse.json({ data: updatedComment })
  } catch (error) {
    if (error instanceof CommentNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
