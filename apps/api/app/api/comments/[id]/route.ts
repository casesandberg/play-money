import { NextResponse } from 'next/server'
import { auth } from '@play-money/auth'
import { deleteComment } from '@play-money/comments/lib/deleteComment'
import { CommentNotFoundError } from '@play-money/comments/lib/exceptions'
import { getComment } from '@play-money/comments/lib/getComment'
import { updateComment } from '@play-money/comments/lib/updateComment'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: unknown }
): Promise<NextResponse<typeof schema.GET.response>> {
  try {
    const { id } = schema.GET.request.params.parse(params)

    const comment = await getComment({ id })

    return NextResponse.json(comment)
  } catch (error) {
    if (error instanceof CommentNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: unknown }
): Promise<NextResponse<typeof schema.PATCH.response>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = schema.PATCH.request.params.parse(params)
    const body = (await req.json()) as unknown
    const { content } = schema.PATCH.request.body.parse(body)

    const comment = await getComment({ id })
    if (comment.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updatedComment = await updateComment({ id, content })

    return NextResponse.json(updatedComment)
  } catch (error) {
    if (error instanceof CommentNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: unknown }
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = schema.DELETE.request.params.parse(params)

    const comment = await getComment({ id })
    if (comment.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await deleteComment({ id })

    return NextResponse.json({ message: 'Comment deleted' })
  } catch (error) {
    if (error instanceof CommentNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
