import { User } from '@play-money/database'

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function isNewlyReferredUser(user: User): boolean {
  const SEVEN_DAYS_AGO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  return user.createdAt > SEVEN_DAYS_AGO && !!user.referredBy
}
