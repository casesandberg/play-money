import { z } from 'zod'
import { CommentWithReactions } from '@play-money/comments/lib/getComment'
import {
  Account,
  Comment,
  CommentSchema,
  List,
  ListSchema,
  Market,
  MarketOption,
  MarketOptionPosition,
  MarketOptionSchema,
  MarketResolution,
  MarketResolutionSchema,
  MarketSchema,
  TransactionSchema,
  User,
} from '@play-money/database'
import { TransactionWithEntries } from '@play-money/finance/types'

export type ExtendedMarket = Market & {
  user: User
  options: Array<MarketOption>
  marketResolution?: MarketResolution & {
    resolution: MarketOption
    resolvedBy: User
  }
  parentList?: List
}

export type ExtendedMarketPosition = MarketOptionPosition & {
  option: MarketOption
  market: Market
  account: Account & {
    user: User
  }
}

export type MarketActivity = {
  type:
    | 'COMMENT'
    | 'TRADE_TRANSACTION'
    | 'LIQUIDITY_TRANSACTION'
    | 'MARKET_CREATED'
    | 'MARKET_RESOLVED'
    | 'MARKET_CANCELED'
    | 'LIST_CREATED'
  timestampAt: Date
  comment?: CommentWithReactions
  transactions?: Array<TransactionWithEntries>
  marketResolution?: MarketResolution & { resolvedBy: User; resolution: MarketOption; market: Market }
  market?: Market & { user: User }
  list?: List & { owner: User }
  option?: MarketOption
}

export const MarketActivitySchema = z.object({
  type: z.enum([
    'COMMENT',
    'TRADE_TRANSACTION',
    'LIQUIDITY_TRANSACTION',
    'MARKET_CREATED',
    'MARKET_RESOLVED',
    'MARKET_CANCELED',
    'LIST_CREATED',
  ]),
  timestampAt: z.date(),
  comment: CommentSchema.optional(),
  transactions: z.array(TransactionSchema).optional(),
  marketResolution: MarketResolutionSchema.optional(),
  market: MarketSchema.optional(),
  list: ListSchema.optional(),
  option: MarketOptionSchema.optional(),
})
