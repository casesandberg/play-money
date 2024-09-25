import {
  CommentReaction,
  Market,
  MarketOption,
  Transaction,
  TransactionEntry,
  User,
  Comment,
  List,
} from '@play-money/database'
import { NotificationTypeType } from '@play-money/database/zod/inputTypeSchemas/NotificationTypeSchema'

interface CreateNotificationBase {
  type: NotificationTypeType
  actorId?: string
  marketId?: string
  marketOptionId?: string
  commentId?: string
  parentCommentId?: string
  commentReactionId?: string
  transactionId?: string
}

interface NotificationContentBase {
  type: NotificationTypeType
}

export interface CreateMarketResolvedNotification extends CreateNotificationBase {
  type: 'MARKET_RESOLVED'
  actorId: string
  marketId: string
  marketOptionId: string
}

export interface MarketResolvedNotificationContent extends NotificationContentBase {
  type: 'MARKET_RESOLVED'
  actor: User
  market: Market
  marketOption: MarketOption
}

export interface MarketTradeNotificationContent extends NotificationContentBase {
  type: 'MARKET_TRADE'
  actor: User
  market: Market
  marketOption: MarketOption
  transaction: Transaction & {
    entries: Array<TransactionEntry>
  }
}

export interface CreateMarketTradeNotification extends CreateNotificationBase {
  type: 'MARKET_TRADE'
  actorId: string
  marketId: string
  marketOptionId: string
  transactionId: string
}

export interface MarketLiquidityAddedNotificationContent extends NotificationContentBase {
  type: 'MARKET_LIQUIDITY_ADDED'
  actor: User
  market: Market
  transaction: Transaction & {
    entries: Array<TransactionEntry>
  }
}

export interface CreateMarketLiquidityAddedNotification extends CreateNotificationBase {
  type: 'MARKET_LIQUIDITY_ADDED'
  actorId: string
  marketId: string
  transactionId: string
}

export interface MarketCommentNotificationContent extends NotificationContentBase {
  type: 'MARKET_COMMENT'
  actor: User
  market: Market
  comment: Comment
}

export interface CreateMarketCommentNotification extends CreateNotificationBase {
  type: 'MARKET_COMMENT'
  actorId: string
  marketId: string
  commentId: string
}

export interface ListCommentNotificationContent extends NotificationContentBase {
  type: 'LIST_COMMENT'
  actor: User
  list: List
  market?: Market
  comment: Comment
}

export interface CreateListCommentNotification extends CreateNotificationBase {
  type: 'LIST_COMMENT'
  actorId: string
  listId: string
  marketId?: string
  commentId: string
}

export interface CommentReplyNotificationContent extends NotificationContentBase {
  type: 'COMMENT_REPLY'
  actor: User
  market?: Market
  list?: List
  comment: Comment
  parentComment: Comment
}

export interface CreateCommentReplyNotification extends CreateNotificationBase {
  type: 'COMMENT_REPLY'
  actorId: string
  marketId?: string
  listId?: string
  commentId: string
  parentCommentId: string
}

export interface CommentReactionNotificationContent extends NotificationContentBase {
  type: 'COMMENT_REACTION'
  actor: User
  market?: Market
  list?: List
  comment: Comment
  commentReaction: CommentReaction
}

export interface CreateCommentReactionNotification extends CreateNotificationBase {
  type: 'COMMENT_REACTION'
  actorId: string
  marketId?: string
  listId?: string
  commentId: string
  commentReactionId: string
}

export interface CommentMentionNotificationContent extends NotificationContentBase {
  type: 'COMMENT_MENTION'
  actor: User
  market?: Market
  list?: List
  comment: Comment
  parentComment?: Comment
}

export interface CreateCommentMentionNotification extends CreateNotificationBase {
  type: 'COMMENT_MENTION'
  actorId: string
  marketId?: string
  listId?: string
  commentId: string
  parentCommentId?: string
}

export type NotificationContent =
  | MarketResolvedNotificationContent
  | MarketTradeNotificationContent
  | MarketLiquidityAddedNotificationContent
  | MarketCommentNotificationContent
  | ListCommentNotificationContent
  | CommentReplyNotificationContent
  | CommentMentionNotificationContent
  | CommentReactionNotificationContent

export type CreateNotificationData =
  | CreateMarketResolvedNotification
  | CreateMarketTradeNotification
  | CreateMarketLiquidityAddedNotification
  | CreateMarketCommentNotification
  | CreateListCommentNotification
  | CreateCommentReplyNotification
  | CreateCommentReactionNotification
  | CreateCommentMentionNotification
