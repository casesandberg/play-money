import { z } from 'zod';

export const TransactionTypeSchema = z.enum(['TRADE_BUY','TRADE_SELL','TRADE_WIN','TRADE_LOSS','CREATOR_TRADER_BONUS','LIQUIDITY_INITIALIZE','LIQUIDITY_DEPOSIT','LIQUIDITY_WITHDRAWAL','LIQUIDITY_RETURNED','LIQUIDITY_VOLUME_BONUS','DAILY_TRADE_BONUS','DAILY_MARKET_BONUS','DAILY_COMMENT_BONUS','DAILY_LIQUIDITY_BONUS','HOUSE_GIFT','HOUSE_SIGNUP_BONUS']);

export type TransactionTypeType = `${z.infer<typeof TransactionTypeSchema>}`

export default TransactionTypeSchema;
