import { NextResponse } from 'next/server'
import { stripUndefined, type SchemaResponse } from '@play-money/api-helpers'
import { getAuthUser } from '@play-money/auth/lib/getAuthUser'
import { deleteComment } from '@play-money/comments/lib/deleteComment'
import { CommentNotFoundError } from '@play-money/comments/lib/exceptions'
import { getComment } from '@play-money/comments/lib/getComment'
import { updateComment } from '@play-money/comments/lib/updateComment'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const { id } = schema.get.parameters.parse(params)

    const comment = await getComment({ id })

    return NextResponse.json({ data: comment })
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
): Promise<SchemaResponse<typeof schema.patch.responses>> {
  try {
    const userId = await getAuthUser(req)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = schema.patch.parameters.parse(params)
    const body = (await req.json()) as unknown
    const { content } = schema.patch.requestBody.transform(stripUndefined).parse(body)

    const comment = await getComment({ id })
    if (comment.authorId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updatedComment = await updateComment({ id, content })

    return NextResponse.json({ data: updatedComment })
  } catch (error) {
    if (error instanceof CommentNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.delete.responses>> {
  try {
    const userId = await getAuthUser(req)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = schema.delete.parameters.parse(params)

    const comment = await getComment({ id })
    if (comment.authorId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await deleteComment({ id })

    return new Response(null, { status: 204 }) as NextResponse<Record<string, never>>
  } catch (error) {
    if (error instanceof CommentNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
