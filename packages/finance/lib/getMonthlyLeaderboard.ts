import Decimal from 'decimal.js'
import { LeaderboardUser } from '../types'

function transformUserOutput(input?: LeaderboardUser): LeaderboardUser | undefined {
  if (!input) {
    return
  }
  return {
    ...input,
    total: new Decimal(input.total).round().toNumber(),
    rank: Number(input.rank),
  }
}

export async function getMonthlyLeaderboard(startDate: Date, endDate: Date, userId?: string) {
  const [topTraders, topCreators, topPromoters, topQuesters] = await Promise.all([
    prisma.$queryRaw<Array<LeaderboardUser>>`
    WITH trader_transactions AS (
        SELECT 
        a.id AS "accountId",
        SUM(CASE 
            WHEN te."fromAccountId" = a.id THEN -te.amount
            WHEN te."toAccountId" = a.id THEN te.amount
            ELSE 0
        END) as net_amount
        FROM "Transaction" t
        JOIN "TransactionEntry" te ON t.id = te."transactionId"
        JOIN "Account" a ON a.id IN (te."fromAccountId", te."toAccountId")
        WHERE t."createdAt" BETWEEN ${startDate} AND ${endDate}
        AND t.type IN ('TRADE_WIN', 'TRADE_SELL', 'TRADE_BUY')
        AND te."assetType" = 'CURRENCY'
        AND a.type = 'USER'
        GROUP BY a.id
    ),
    option_transactions AS (
        SELECT 
        a.id AS "accountId",
        te."assetId" as "optionId",
        SUM(CASE 
            WHEN te."fromAccountId" = a.id THEN -te.amount
            WHEN te."toAccountId" = a.id THEN te.amount
            ELSE 0
        END) as period_quantity
        FROM "Transaction" t
        JOIN "TransactionEntry" te ON t.id = te."transactionId"
        JOIN "Account" a ON a.id IN (te."fromAccountId", te."toAccountId")
        WHERE t."createdAt" BETWEEN ${startDate} AND ${endDate}
        AND t.type IN ('TRADE_BUY', 'TRADE_SELL')
        AND te."assetType" = 'MARKET_OPTION'
        AND a.type = 'USER'
        GROUP BY a.id, te."assetId"
    ),
    option_holdings AS (
        SELECT 
        ot."accountId",
        ot."optionId",
        CASE
            WHEN mop.quantity != 0 THEN 
            (ot.period_quantity / mop.quantity) * mop.value
            ELSE 0
        END as holding_value
        FROM option_transactions ot
        JOIN "MarketOptionPosition" mop 
        ON ot."accountId" = mop."accountId" 
        AND ot."optionId" = mop."optionId"
        WHERE mop.quantity > 0  -- Ensure we're not dividing by zero
    )
    ,
    user_profits AS (
        SELECT 
        u.id as "userId",
        u."displayName",
        u."username",
        u."avatarUrl",
        COALESCE(tt.net_amount, 0) + COALESCE(SUM(oh.holding_value), 0) as total
        FROM "User" u
        LEFT JOIN trader_transactions tt ON u."primaryAccountId" = tt."accountId"
        LEFT JOIN option_holdings oh ON u."primaryAccountId" = oh."accountId"
        GROUP BY u.id, u."displayName", tt.net_amount
    )
    SELECT 
        "userId",
        "displayName",
        "username",
        "avatarUrl",
        total,
        RANK() OVER (ORDER BY total DESC) as rank
    FROM user_profits
    -- WHERE COALESCE(total, 0) > 0
    ORDER BY total DESC;
  `,
    prisma.$queryRaw<Array<LeaderboardUser>>`
      WITH creator_bonuses AS (
        SELECT 
          a.id AS "accountId",
          SUM(CASE 
            WHEN te."fromAccountId" = a.id THEN -te.amount
            WHEN te."toAccountId" = a.id THEN te.amount
            ELSE 0
          END) as total
        FROM "Transaction" t
        JOIN "TransactionEntry" te ON t.id = te."transactionId"
        JOIN "Account" a ON a.id IN (te."fromAccountId", te."toAccountId")
        WHERE t."createdAt" BETWEEN ${startDate} AND ${endDate}
          AND t.type = 'CREATOR_TRADER_BONUS'
          AND te."assetType" = 'CURRENCY'
          AND a.type = 'USER'
        GROUP BY a.id
      )
      SELECT 
        u.id as "userId",
        u."displayName",
        u."username",
        u."avatarUrl",
        COALESCE(cb.total, 0) as total,
        RANK() OVER (ORDER BY COALESCE(cb.total, 0) DESC) as rank
      FROM "User" u
      LEFT JOIN creator_bonuses cb ON u."primaryAccountId" = cb."accountId"
    --   WHERE COALESCE(cb.total, 0) > 0
      ORDER BY total DESC
    `,
    prisma.$queryRaw<Array<LeaderboardUser>>`
      WITH promoter_bonuses AS (
        SELECT 
          a.id AS "accountId",
          SUM(CASE 
            WHEN te."fromAccountId" = a.id THEN -te.amount
            WHEN te."toAccountId" = a.id THEN te.amount
            ELSE 0
          END) as total
        FROM "Transaction" t
        JOIN "TransactionEntry" te ON t.id = te."transactionId"
        JOIN "Account" a ON a.id IN (te."fromAccountId", te."toAccountId")
        WHERE t."createdAt" BETWEEN ${startDate} AND ${endDate}
          AND t.type = 'LIQUIDITY_VOLUME_BONUS'
          AND te."assetType" = 'CURRENCY'
          AND a.type = 'USER'
        GROUP BY a.id
      )
      SELECT 
        u.id as "userId",
        u."displayName",
        u."username",
        u."avatarUrl",
        COALESCE(pb.total, 0) as total,
        RANK() OVER (ORDER BY COALESCE(pb.total, 0) DESC) as rank
      FROM "User" u
      LEFT JOIN promoter_bonuses pb ON u."primaryAccountId" = pb."accountId"
    --   WHERE COALESCE(pb.total, 0) > 0
      ORDER BY total DESC
    `,
    prisma.$queryRaw<Array<LeaderboardUser>>`
      WITH quester_bonuses AS (
        SELECT 
          a.id AS "accountId",
          SUM(CASE 
            WHEN te."fromAccountId" = a.id THEN -te.amount
            WHEN te."toAccountId" = a.id THEN te.amount
            ELSE 0
          END) as total
        FROM "Transaction" t
        JOIN "TransactionEntry" te ON t.id = te."transactionId"
        JOIN "Account" a ON a.id IN (te."fromAccountId", te."toAccountId")
        WHERE t."createdAt" BETWEEN ${startDate} AND ${endDate}
          AND t.type IN ('DAILY_TRADE_BONUS', 'DAILY_MARKET_BONUS', 'DAILY_COMMENT_BONUS', 'DAILY_LIQUIDITY_BONUS')
          AND te."assetType" = 'CURRENCY'
          AND a.type = 'USER'
        GROUP BY a.id
      )
      SELECT 
        u.id as "userId",
        u."displayName",
        u."username",
        u."avatarUrl",
        COALESCE(qb.total, 0) as total,
        RANK() OVER (ORDER BY COALESCE(qb.total, 0) DESC) as rank
      FROM "User" u
      LEFT JOIN quester_bonuses qb ON u."primaryAccountId" = qb."accountId"
    --   WHERE COALESCE(qb.total, 0) > 0
      ORDER BY total DESC
    `,
  ])

  let userRankings = null
  if (userId) {
    userRankings = {
      trader: transformUserOutput(topTraders.find((t) => t.userId === userId)) || { rank: null, total: 0 },
      creator: transformUserOutput(topCreators.find((c) => c.userId === userId)) || { rank: null, total: 0 },
      promoter: transformUserOutput(topPromoters.find((p) => p.userId === userId)) || { rank: null, total: 0 },
      quester: transformUserOutput(topQuesters.find((q) => q.userId === userId)) || { rank: null, total: 0 },
    }
  }

  const first = topTraders[0]

  return {
    topTraders: topTraders.slice(0, 10).map(transformUserOutput),
    topCreators: topCreators.slice(0, 10).map(transformUserOutput),
    topPromoters: topPromoters.slice(0, 10).map(transformUserOutput),
    topQuesters: topQuesters.slice(0, 10).map(transformUserOutput),
    userRankings,
  }
}
