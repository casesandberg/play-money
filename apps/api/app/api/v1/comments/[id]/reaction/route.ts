import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { getAuthUser } from '@play-money/auth/lib/getAuthUser'
import { reactToComment } from '@play-money/comments/lib/reactToComment'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.post.responses>> {
  try {
    const userId = await getAuthUser(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as unknown
    const data = schema.post.requestBody.parse(body)
    const { id } = schema.post.parameters.parse(params)

    const commentReaction = await reactToComment({ commentId: id, userId, ...data })

    if (commentReaction === 'removed') {
      return new Response(null, { status: 204 }) as NextResponse<void>
    }

    return NextResponse.json({ data: commentReaction })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
