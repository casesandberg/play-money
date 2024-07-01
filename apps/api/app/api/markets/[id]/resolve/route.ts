import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { auth } from '@play-money/auth'
import { resolveMarket } from '@play-money/markets/lib/resolveMarket'
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
    const { optionId, supportingLink } = schema.post.requestBody.parse(body)

    await resolveMarket({
      resolverId: session.user.id,
      marketId: id,
      optionId,
      supportingLink,
    })

    return NextResponse.json({})
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
