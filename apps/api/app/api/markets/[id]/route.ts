import { NextResponse } from 'next/server'
import { stripUndefined, type SchemaResponse } from '@play-money/api-helpers'
import { auth } from '@play-money/auth'
import { CommentNotFoundError } from '@play-money/comments/lib/exceptions'
import { getUserMarketOptionIncome } from '@play-money/finance/lib/getUserMarketOptionIncome'
import { getUserPrimaryAccount } from '@play-money/finance/lib/getUserPrimaryAccount'
import { getMarket } from '@play-money/markets/lib/getMarket'
import { updateMarket } from '@play-money/markets/lib/updateMarket'
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

    const session = await auth()
    const userAccount = session?.user?.id ? await getUserPrimaryAccount({ userId: session.user.id }) : undefined

    if (extended) {
      const market = await getMarket({ id, extended })

      // TODO: Move cost and value into P&L document
      market.options = await Promise.all(
        market.options.map(async (option) => {
          if (userAccount) {
            const { cost, value } = await getUserMarketOptionIncome({
              accountId: userAccount.id,
              marketId: id,
              optionId: option.id,
            })

            option.cost = cost
            option.value = value
          }

          return option
        })
      )

      return NextResponse.json(market)
    }

    const market = await getMarket({ id })
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
    const { question, description, closeDate } = schema.patch.requestBody.transform(stripUndefined).parse(body)

    const market = await getMarket({ id })
    if (market.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updatedComment = await updateMarket({ id, question, description, closeDate })

    return NextResponse.json(updatedComment)
  } catch (error) {
    if (error instanceof CommentNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
