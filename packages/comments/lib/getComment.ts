import db from '@play-money/database'
import { CommentNotFoundError } from './exceptions'

export async function getComment({ id }: { id: string }) {
  const comment = await db.comment.findUnique({
    where: {
      id,
    },
  })

  if (!comment) {
    throw new CommentNotFoundError(`Comment with id "${id}" not found`)
  }

  return comment
}
