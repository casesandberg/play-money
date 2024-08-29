import { Market, MarketOption, Transaction, TransactionEntry, User } from '@play-money/database'

export type TransactionEntryInput = Pick<
  TransactionEntry,
  'amount' | 'assetType' | 'assetId' | 'fromAccountId' | 'toAccountId'
>

export type TransactionWithEntries = Transaction & {
  entries: Array<TransactionEntry>
  market: Market | null
  initiator: User | null
  options: Array<MarketOption>
}

export type LeaderboardUser = {
  userId: string
  displayName: string
  username: string
  avatarUrl?: string | null
  total: number
  rank: number
}
