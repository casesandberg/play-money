import db from '@play-money/database'

export async function getUnreadNotificationCount({ userId }: { userId: string }): Promise<number> {
  const unreadCount = await db.notificationGroup.count({
    where: {
      recipientId: userId,
      lastNotification: {
        readAt: null,
      },
    },
  })

  return unreadCount
}
