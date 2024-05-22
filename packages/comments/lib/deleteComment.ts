import db, { CommentSchema } from '@play-money/database'

export async function deleteComment({ id }: { id: string }) {
  await db.comment.delete({
    where: { id },
  })

  return
}
