import db, { Comment } from '@play-money/database'

export async function createComment({
  content,
  authorId,
  parentId,
  entityType,
  entityId,
}: Pick<Comment, 'content' | 'authorId' | 'parentId' | 'entityType' | 'entityId'>) {
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
