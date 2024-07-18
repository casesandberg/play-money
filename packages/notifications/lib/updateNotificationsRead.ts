import db from '@play-money/database'

export async function updateNotificationsRead({
  userId,
  marketId,
}: {
  userId: string
  marketId: string
}): Promise<number> {
  const now = new Date()

  const result = await db.notification.updateMany({
    where: {
      recipientId: userId,
      readAt: null,
      marketId: marketId,
    },
    data: {
      readAt: now,
    },
  })

  return result.count
}
