import db, { Comment } from '@play-money/database'
import { getList } from '@play-money/lists/lib/getList'
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

  const entity = entityType === 'MARKET' ? await getMarket({ id: entityId }) : await getList({ id: entityId })

  const userIdsMentioned = extractUniqueMentionIds(content)

  await Promise.all(
    userIdsMentioned.map(async (mentionedUserId) => {
      if (mentionedUserId === authorId) return

      await createNotification({
        type: 'COMMENT_MENTION',
        actorId: authorId,
        ...(entityType === 'MARKET' ? { marketId: entity.id } : { list: entity.id }),
        commentId: comment.id,
        parentCommentId: parentId ?? undefined,
        groupKey: entity.id,
        userId: mentionedUserId,
        actionUrl: `/${entityType === 'MARKET' ? 'questions' : 'lists'}/${entity.id}/${entity.slug}#${comment.id}`,
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
      ...(entityType === 'MARKET' ? { marketId: entity.id } : { list: entity.id }),
      commentId: comment.id,
      parentCommentId: parentId ?? undefined,
      groupKey: entity.id,
      userId: comment.parent.authorId,
      actionUrl: `/${entityType === 'MARKET' ? 'questions' : 'lists'}/${entity.id}/${entity.slug}#${comment.id}`,
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

  if (entityType === 'MARKET') {
    // TODO switch this to watchers of the market.
    const recipientIds = await getUniqueLiquidityProviderIds(entity.id, [
      authorId,
      comment.parent?.authorId,
      ...userIdsMentioned,
    ])

    await Promise.all(
      recipientIds.map((recipientId) =>
        createNotification({
          type: 'MARKET_COMMENT',
          actorId: authorId,
          marketId: entity.id,
          commentId: comment.id,
          parentCommentId: parentId ?? undefined,
          groupKey: entity.id,
          userId: recipientId,
          actionUrl: `/questions/${entity.id}/${entity.slug}#${comment.id}`,
        })
      )
    )
  } else if (entityType === 'LIST') {
    const list = await getList({ id: entityId })

    if (authorId !== list.ownerId) {
      createNotification({
        type: 'LIST_COMMENT',
        actorId: authorId,
        listId: entity.id,
        commentId: comment.id,
        parentCommentId: parentId ?? undefined,
        groupKey: entity.id,
        userId: list.ownerId,
        actionUrl: `/lists/${entity.id}/${entity.slug}#${comment.id}`,
      })
    }
  }

  if (!(await hasCommentedToday({ userId: authorId }))) {
    const userAccount = await getUserPrimaryAccount({ userId: authorId })
    await createDailyCommentBonusTransaction({
      accountId: userAccount.id,
      marketId: entityType === 'MARKET' ? entity.id : undefined,
      initiatorId: authorId,
    })
  }

  return comment
}
