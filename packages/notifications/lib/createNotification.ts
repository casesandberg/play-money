import { v4 as uuidv4 } from 'uuid'
import db from '@play-money/database'
import { CreateNotificationData } from '../types'

export async function createNotification({
  userId,
  type,
  groupKey,
  actionUrl,
  actorId,
  marketId,
  commentId,
  commentReactionId,
  parentCommentId,
  transactionId,
  marketOptionId,
  listId,
}: {
  userId: string
  actionUrl: string
  groupKey: string
  listId?: string
} & CreateNotificationData) {
  const isGroupable = ['MARKET_TRADE', 'MARKET_LIQUIDITY_ADDED', 'COMMENT_REACTION'].includes(type)

  const notification = await db.notification.create({
    data: {
      recipientId: userId,
      type,
      actionUrl,
      actorId,
      content: {},
      marketId,
      commentId,
      commentReactionId,
      parentCommentId,
      transactionId,
      marketOptionId,
      listId,
    },
  })

  const groupingWindowHours = 24 // TODO: Make this configurable by the user

  const now = new Date()
  const groupWindowEnd = new Date(now.getTime() + groupingWindowHours * 60 * 60 * 1000)
  groupWindowEnd.setMinutes(0, 0, 0) // Round to the nearest hour

  if (isGroupable) {
    await db.notificationGroup.upsert({
      where: {
        recipientId_type_groupWindowEnd_groupKey: {
          recipientId: userId,
          type,
          groupWindowEnd,
          groupKey,
        },
      },
      update: {
        count: { increment: 1 },
        lastNotificationId: notification.id,
        updatedAt: now,
      },
      create: {
        recipientId: userId,
        type,
        lastNotificationId: notification.id,
        groupWindowEnd,
        groupKey,
        createdAt: now,
        updatedAt: now,
      },
    })
  } else {
    const uniqueGroupKey = uuidv4()

    await db.notificationGroup.create({
      data: {
        recipientId: userId,
        type,
        lastNotificationId: notification.id,
        groupWindowEnd: now,
        groupKey: uniqueGroupKey,
        createdAt: now,
        updatedAt: now,
      },
    })
  }
}
