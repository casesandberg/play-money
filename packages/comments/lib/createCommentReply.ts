import { z } from 'zod'
import { _CommentModel, _UserModel } from '@play-money/database'
import { createComment } from './createComment'
import { getComment } from './getComment'

export const CreateSchema = _CommentModel.pick({
  content: true,
  authorId: true,
  parentId: true,
})

export async function createCommentReply({ content, authorId, parentId }: z.infer<typeof CreateSchema>) {
  if (!parentId) {
    throw new Error('Parent comment id is required')
  }

  const parentComment = await getComment({ id: parentId })

  const comment = await createComment({
    content,
    authorId,
    parentId,
    entityType: parentComment.entityType,
    entityId: parentComment.entityId,
  })

  return comment
}
