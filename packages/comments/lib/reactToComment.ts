import db, { CommentReaction } from '@play-money/database'
import { getMarket } from '@play-money/markets/lib/getMarket'
import { createNotification } from '@play-money/notifications/lib/createNotification'

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
    include: {
      comment: true,
    },
  })

  if (userId !== reaction.comment.authorId) {
    const market = await getMarket({ id: reaction.comment.entityId })

    await createNotification({
      type: 'COMMENT_REACTION',
      actorId: userId,
      marketId: market.id,
      commentId: reaction.comment.id,
      commentReactionId: reaction.id,
      groupKey: market.id,
      userId: reaction.comment.authorId,
      actionUrl: `/questions/${market.id}/${market.slug}#${reaction.comment.id}`,
    })
  }

  return reaction
}
