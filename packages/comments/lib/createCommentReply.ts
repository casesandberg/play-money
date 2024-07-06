import { Comment } from '@play-money/database'
import { createComment } from './createComment'
import { getComment } from './getComment'

export async function createCommentReply({
  content,
  authorId,
  parentId,
}: Pick<Comment, 'content' | 'authorId' | 'parentId'>) {
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
