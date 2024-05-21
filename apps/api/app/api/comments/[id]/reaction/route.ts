import { NextResponse } from 'next/server'
import { auth } from '@play-money/auth'
import { reactToComment } from '@play-money/comments/lib/reactToComment'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  { params }: { params: unknown }
): Promise<NextResponse<typeof schema.POST.response>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as unknown
    const data = schema.POST.request.body.parse(body)
    const { id } = schema.POST.request.params.parse(params)

    const commentReaction = await reactToComment({ commentId: id, userId: session.user.id, ...data })

    if (commentReaction === 'removed') {
      return NextResponse.json({ message: 'Reaction removed' })
    }

    return NextResponse.json(commentReaction)
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
