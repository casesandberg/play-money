import {
  Market,
  MarketOption,
  MarketOptionPosition,
  Transaction,
  TransactionEntry,
  User,
  Account,
} from '@play-money/database'

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

export type ExtendedMarketOptionPosition = MarketOptionPosition & {
  market: Market
  option: MarketOption
  account: Account & {
    user: User | null
  }
}
