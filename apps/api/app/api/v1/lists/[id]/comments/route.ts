import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { CommentNotFoundError } from '@play-money/comments/lib/exceptions'
import { getCommentsOnList } from '@play-money/lists/lib/getCommentsOnList'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const { id } = schema.get.parameters.parse(params)

    const comments = await getCommentsOnList({ listId: id })

    return NextResponse.json({ data: comments })
  } catch (error) {
    if (error instanceof CommentNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
