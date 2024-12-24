import { List } from '@play-money/database'
import { User } from '@play-money/database'
import { isAdmin } from '@play-money/users/rules'

export function canAddToList({ list, userId }: { list: List; userId?: string }) {
  return list.contributionPolicy === 'PUBLIC' || (list.contributionPolicy === 'OWNERS_ONLY' && list.ownerId === userId)
}

export function canModifyList({ list, user }: { list: List; user: User }) {
  return list.ownerId === user.id || isAdmin({ user })
}
