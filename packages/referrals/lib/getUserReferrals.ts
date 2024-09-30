import db from '@play-money/database'

export async function getUserReferrals({ userId }: { userId: string }) {
  return db.user.findMany({
    where: {
      referredBy: userId,
    },
  })
}
