import { List } from '@play-money/database'

export function canAddToList({ list, userId }: { list: List; userId?: string }) {
  return list.contributionPolicy === 'PUBLIC' || (list.contributionPolicy === 'OWNERS_ONLY' && list.ownerId === userId)
}
