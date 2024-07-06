import db, { CommentReaction } from '@play-money/database'

export async function reactToComment({
  emoji,
  userId,
  commentId,
}: Pick<CommentReaction, 'emoji' | 'userId' | 'commentId'>) {
  const existingReaction = await db.commentReaction.findFirst({
    where: {
      emoji,
      userId,
      commentId,
    },
  })

  if (existingReaction) {
    await db.commentReaction.delete({
      where: {
        id: existingReaction.id,
      },
    })

    return 'removed'
  }

  const reaction = await db.commentReaction.create({
    data: {
      emoji,
      userId,
      commentId,
    },
  })

  return reaction
}
