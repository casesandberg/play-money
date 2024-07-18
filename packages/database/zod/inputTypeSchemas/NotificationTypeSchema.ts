import { z } from 'zod';

export const NotificationTypeSchema = z.enum(['MARKET_RESOLVED','MARKET_TRADE','MARKET_LIQUIDITY_ADDED','MARKET_COMMENT','COMMENT_REPLY','COMMENT_MENTION','COMMENT_REACTION']);

export type NotificationTypeType = `${z.infer<typeof NotificationTypeSchema>}`

export default NotificationTypeSchema;
