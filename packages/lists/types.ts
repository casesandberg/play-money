import { List, User } from '@play-money/database'
import { ExtendedMarket } from '@play-money/markets/types'

export type ExtendedList = List & {
  owner: User
  markets: Array<{
    createdAt: Date
    market: ExtendedMarket
  }>
}
