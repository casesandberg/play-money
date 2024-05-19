import { NextResponse } from 'next/server'
import { CommentNotFoundError } from '@play-money/comments/lib/exceptions'
import { getCommentsOnMarket } from '@play-money/comments/lib/getCommentsOnMarket'
import { _UserModel } from '@play-money/database'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: unknown }
): Promise<NextResponse<typeof schema.GET.response>> {
  try {
    const { id } = schema.GET.request.params.parse(params)

    const comments = await getCommentsOnMarket({ marketId: id })

    return NextResponse.json({ comments })
  } catch (error) {
    if (error instanceof CommentNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
