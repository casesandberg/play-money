import db, { NotificationGroup, Notification } from '@play-money/database'
import { NotificationContent } from '../types'

export type NotificationGroupWithLastNotification = NotificationGroup & {
  lastNotification: Notification & NotificationContent
}

type NotificationFilterOptions = {
  userId?: string
}

type SortOptions = {
  field: string
  direction: 'asc' | 'desc'
}

type PaginationOptions = {
  skip: number
  take: number
}

export async function getNotifications(
  filters: NotificationFilterOptions = {},
  sort: SortOptions = { field: 'createdAt', direction: 'desc' },
  pagination: PaginationOptions = { skip: 0, take: 50 }
): Promise<Array<NotificationGroupWithLastNotification>> {
  const notifications = await db.notificationGroup.findMany({
    where: {
      recipientId: filters.userId,
    },
    include: {
      lastNotification: {
        include: {
          actor: true,
          market: true,
          comment: true,
          commentReaction: true,
          parentComment: true,
          transaction: {
            include: {
              entries: true,
            },
          },
          marketOption: true,
        },
      },
    },
    orderBy: {
      [sort.field]: sort.direction,
    },
    skip: pagination.skip,
    take: pagination.take,
  })

  return notifications as Array<NotificationGroupWithLastNotification>
}
