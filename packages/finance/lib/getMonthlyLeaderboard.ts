import { Prisma } from '@prisma/client'
import Decimal from 'decimal.js'
import db from '@play-money/database'
import { LeaderboardUser } from '../types'

function transformUserOutput(input: LeaderboardUser): LeaderboardUser {
  return {
    ...input,
    total: new Decimal(input.total).round().toNumber(),
    rank: Number(input.rank),
  }
}

export async function getMonthlyLeaderboard(startDate: Date, endDate: Date, userId?: string | null) {
  const usernamesToIgnore = ['house', 'community']
  const [topTraders, topCreators, topPromoters, topQuesters, topReferrers] = await Promise.all([
    db.$queryRaw<Array<LeaderboardUser>>`
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
        COALESCE(tt.net_amount, 0) as total
        FROM "User" u
        LEFT JOIN trader_transactions tt ON u."primaryAccountId" = tt."accountId"
        WHERE u."username" NOT IN (${Prisma.join(usernamesToIgnore)})
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
    db.$queryRaw<Array<LeaderboardUser>>`
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
      WHERE u."username" NOT IN (${Prisma.join(usernamesToIgnore)})
    --   WHERE COALESCE(cb.total, 0) > 0
      ORDER BY total DESC
    `,
    db.$queryRaw<Array<LeaderboardUser>>`
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
      WHERE u."username" NOT IN (${Prisma.join(usernamesToIgnore)})
    --   WHERE COALESCE(pb.total, 0) > 0
      ORDER BY total DESC
    `,
    db.$queryRaw<Array<LeaderboardUser>>`
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
      WHERE u."username" NOT IN (${Prisma.join(usernamesToIgnore)})
    --   WHERE COALESCE(qb.total, 0) > 0
      ORDER BY total DESC
    `,
    db.$queryRaw<Array<LeaderboardUser>>`
      WITH referrer_bonuses AS (
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
          AND t.type IN ('REFERRER_BONUS')
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
      LEFT JOIN referrer_bonuses qb ON u."primaryAccountId" = qb."accountId"
      WHERE u."username" NOT IN (${Prisma.join(usernamesToIgnore)})
    --   WHERE COALESCE(qb.total, 0) > 0
      ORDER BY total DESC
    `,
  ])

  let userRankings = null
  if (userId) {
    const traderRanking = topTraders.find((t) => t.userId === userId)
    const creatorRanking = topCreators.find((c) => c.userId === userId)
    const promoterRanking = topPromoters.find((p) => p.userId === userId)
    const quester = topQuesters.find((q) => q.userId === userId)
    const referrers = topReferrers.find((q) => q.userId === userId)

    userRankings = {
      trader: traderRanking ? transformUserOutput(traderRanking) : undefined,
      creator: creatorRanking ? transformUserOutput(creatorRanking) : undefined,
      promoter: promoterRanking ? transformUserOutput(promoterRanking) : undefined,
      quester: quester ? transformUserOutput(quester) : undefined,
      referrers: referrers ? transformUserOutput(referrers) : undefined,
    }
  }

  return {
    topTraders: topTraders.slice(0, 10).map(transformUserOutput),
    topCreators: topCreators.slice(0, 10).map(transformUserOutput),
    topPromoters: topPromoters.slice(0, 10).map(transformUserOutput),
    topQuesters: topQuesters.slice(0, 10).map(transformUserOutput),
    topReferrers: topReferrers.slice(0, 10).map(transformUserOutput) || [],
    userRankings,
  }
}
