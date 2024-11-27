import { NextResponse } from 'next/server'
import { stripUndefined, type SchemaResponse } from '@play-money/api-helpers'
import { auth } from '@play-money/auth'
import { CommentNotFoundError } from '@play-money/comments/lib/exceptions'
import { getMarket } from '@play-money/markets/lib/getMarket'
import { updateMarket } from '@play-money/markets/lib/updateMarket'
import { canModifyMarket } from '@play-money/markets/rules'
import { getUserById } from '@play-money/users/lib/getUserById'
import schema from './schema'

export const dynamic = 'force-dynamic'

// TODO: Look into a better way to handle mixing vercel params and search params together...
export async function GET(
  req: Request,
  { params: idParams }: { params: Record<string, unknown> }
): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.search)
    const params = Object.fromEntries(searchParams)

    if (params.extended) {
      // TODO: Transform this within zod before parsing. This is a workaround for now.
      params.extended = (params.extended === 'true') as unknown as string
    }

    const { id, extended } = schema.get.parameters.parse({ ...params, ...idParams })

    const market = await getMarket({ id, extended })
    return NextResponse.json(market)
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.patch.responses>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = schema.patch.parameters.parse(params)
    const body = (await req.json()) as unknown
    const { question, description, closeDate, tags } = schema.patch.requestBody.transform(stripUndefined).parse(body)

    const market = await getMarket({ id })
    const user = await getUserById({ id: session.user.id })

    if (!canModifyMarket({ market, user })) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updatedMarket = await updateMarket({ id, question, description, closeDate, tags })

    return NextResponse.json(updatedMarket)
  } catch (error) {
    if (error instanceof CommentNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
