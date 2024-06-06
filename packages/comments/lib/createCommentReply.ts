import { z } from 'zod'
import { Comment, CommentSchema } from '@play-money/database'
import { createComment } from './createComment'
import { getComment } from './getComment'

export type CreateComment = Pick<Comment, 'content' | 'authorId' | 'parentId'>

export async function createCommentReply({ content, authorId, parentId }: CreateComment) {
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
