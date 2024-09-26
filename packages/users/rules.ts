import { User } from '@play-money/database'

export function isAdmin({ user }: { user: User }) {
  return user.role === 'ADMIN'
}
