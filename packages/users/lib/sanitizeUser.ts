import zod from 'zod'
import { UserSchema } from '@play-money/database'

export const UserProfileModel = UserSchema.omit({
  email: true,
  emailVerified: true,
})

export type UserProfile = zod.infer<typeof UserProfileModel>

export function sanitizeUser(user: zod.infer<typeof UserSchema>): UserProfile {
  const data = UserProfileModel.safeParse(user).data as UserProfile

  return {
    ...data,
    avatarUrl: data.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${data.username}&scale=75`,
  }
}
