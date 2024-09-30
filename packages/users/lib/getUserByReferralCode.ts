import db from '@play-money/database'
import { UserNotFoundError } from './exceptions'

export async function getUserByReferralCode({ code }: { code: string }) {
  const user = await db.user.findUnique({
    where: {
      referralCode: code,
    },
  })

  if (!user) {
    throw new UserNotFoundError(`User with referral code "${code}" not found`)
  }

  return user
}
