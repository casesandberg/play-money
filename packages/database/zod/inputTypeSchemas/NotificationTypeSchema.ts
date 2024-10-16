import { z } from 'zod';

export const NotificationTypeSchema = z.enum(['MARKET_RESOLVED','MARKET_CANCELED','MARKET_TRADE','MARKET_LIQUIDITY_ADDED','MARKET_COMMENT','LIST_COMMENT','LIST_MARKET_ADDED','COMMENT_REPLY','COMMENT_MENTION','COMMENT_REACTION','REFERRER_BONUS']);

export type NotificationTypeType = `${z.infer<typeof NotificationTypeSchema>}`

export default NotificationTypeSchema;
