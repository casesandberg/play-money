import { z } from 'zod'
import db, { CommentEntityType, _CommentModel, _UserModel } from '@play-money/database'

export const CreateSchema = _CommentModel
  .pick({
    content: true,
    authorId: true,
    parentId: true,
    entityId: true,
  })
  .extend({
    entityType: z.nativeEnum(CommentEntityType), // TODO: @casesandberg Errors when we try to pick this out of the model. Look into fix.
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
