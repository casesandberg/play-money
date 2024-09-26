import db from '@play-money/database'

export async function updateNotificationsRead({
  userId,
  marketId,
  listId,
}: {
  userId: string
  marketId?: string
  listId?: string
}): Promise<number> {
  const now = new Date()

  const result = await db.notification.updateMany({
    where: {
      recipientId: userId,
      readAt: null,
      marketId: marketId,
      listId: listId,
    },
    data: {
      readAt: now,
    },
  })

  return result.count
}
