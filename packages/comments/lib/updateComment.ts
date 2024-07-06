import db, { Comment } from '@play-money/database'

export async function updateComment({ id, content }: { id: string; content?: string }) {
  const updatedData: Partial<Comment> = {}

  if (content) {
    updatedData.content = content
    updatedData.edited = true
  }

  const updatedComment = await db.comment.update({
    where: { id },
    data: updatedData,
  })

  return updatedComment
}
