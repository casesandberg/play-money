import db, { Comment } from '@play-money/database'
import { getMarket } from '@play-money/markets/lib/getMarket'
import { getUniqueLiquidityProviderIds } from '@play-money/markets/lib/getUniqueLiquidityProviderIds'
import { createNotification } from '@play-money/notifications/lib/createNotification'
import { createDailyCommentBonusTransaction } from '@play-money/quests/lib/createDailyCommentBonusTransaction'
import { hasCommentedToday } from '@play-money/quests/lib/helpers'
import { getUserPrimaryAccount } from '@play-money/users/lib/getUserPrimaryAccount'

function extractUniqueMentionIds(htmlString: string): string[] {
  const mentionRegex = /<mention[^>]*data-id="([^"]*)"[^>]*>/g
  const uniqueIds = new Set<string>()

  let match
  while ((match = mentionRegex.exec(htmlString)) !== null) {
    if (match[1]) {
      uniqueIds.add(match[1])
    }
  }

  return Array.from(uniqueIds)
}

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
    include: {
      parent: true,
    },
  })

  const market = await getMarket({ id: entityId })
  const userIdsMentioned = extractUniqueMentionIds(content)

  await Promise.all(
    userIdsMentioned.map(async (mentionedUserId) => {
      if (mentionedUserId === authorId) return

      await createNotification({
        type: 'COMMENT_MENTION',
        actorId: authorId,
        marketId: market.id,
        commentId: comment.id,
        parentCommentId: parentId ?? undefined,
        groupKey: market.id,
        userId: mentionedUserId,
        actionUrl: `/questions/${market.id}/${market.slug}#${comment.id}`,
      })
    })
  )

  if (
    parentId &&
    comment.parent &&
    authorId !== comment.parent?.authorId &&
    !userIdsMentioned.includes(comment.parent?.authorId)
  ) {
    await createNotification({
      type: 'COMMENT_REPLY',
      actorId: authorId,
      marketId: market.id,
      commentId: comment.id,
      parentCommentId: parentId ?? undefined,
      groupKey: market.id,
      userId: comment.parent.authorId,
      actionUrl: `/questions/${market.id}/${market.slug}#${comment.id}`,
    })
  }

  if (entityType === 'MARKET') {
    await db.market.update({
      where: {
        id: entityId,
      },
      data: {
        commentCount: {
          increment: 1,
        },
        updatedAt: new Date(),
      },
    })
  }

  // TODO switch this to watchers of the market.
  const recipientIds = await getUniqueLiquidityProviderIds(market.id, [
    authorId,
    comment.parent?.authorId,
    ...userIdsMentioned,
  ])

  await Promise.all(
    recipientIds.map((recipientId) =>
      createNotification({
        type: 'MARKET_COMMENT',
        actorId: authorId,
        marketId: market.id,
        commentId: comment.id,
        parentCommentId: parentId ?? undefined,
        groupKey: market.id,
        userId: recipientId,
        actionUrl: `/questions/${market.id}/${market.slug}#${comment.id}`,
      })
    )
  )

  if (!(await hasCommentedToday({ userId: authorId }))) {
    const userAccount = await getUserPrimaryAccount({ userId: authorId })
    await createDailyCommentBonusTransaction({ accountId: userAccount.id, marketId: market.id, initiatorId: authorId })
  }

  return comment
}
