import db, { CommentReaction } from '@play-money/database'
import { getList } from '@play-money/lists/lib/getList'
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
    const entity =
      reaction.comment.entityType === 'MARKET'
        ? await getMarket({ id: reaction.comment.entityId })
        : await getList({ id: reaction.comment.entityId })

    await createNotification({
      type: 'COMMENT_REACTION',
      actorId: userId,
      ...(reaction.comment.entityType === 'MARKET' ? { marketId: entity.id } : { list: entity.id }),
      commentId: reaction.comment.id,
      commentReactionId: reaction.id,
      groupKey: entity.id,
      userId: reaction.comment.authorId,
      actionUrl: `/${reaction.comment.entityType === 'MARKET' ? 'questions' : 'lists'}/${entity.id}/${entity.slug}#${reaction.comment.id}`,
    })
  }

  return reaction
}
