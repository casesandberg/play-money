import { z } from 'zod'
import db, { CommentSchema } from '@play-money/database'

export const CreateSchema = CommentSchema.pick({
  content: true,
  authorId: true,
  parentId: true,
  entityType: true,
  entityId: true,
})

export async function createComment({
  content,
  authorId,
  parentId,
  entityType,
  entityId,
}: z.infer<typeof CreateSchema>) {
  const comment = await db.comment.create({
    data: {
      content,
      authorId,
      parentId,
      entityType,
      entityId,
    },
  })

  return comment
}
