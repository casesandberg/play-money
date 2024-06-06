import db, { Comment } from '@play-money/database'

export type CreateCommentInput = Pick<Comment, 'content' | 'authorId' | 'parentId' | 'entityId' | 'entityType'>

export async function createComment({ content, authorId, parentId, entityType, entityId }: CreateCommentInput) {
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
