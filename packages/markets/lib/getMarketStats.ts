import Decimal from 'decimal.js'
import { getAccountBalance } from '@play-money/accounts/lib/getAccountBalance'
import { getHouseAccount } from '@play-money/accounts/lib/getHouseAccount'
import { getUserAccount } from '@play-money/accounts/lib/getUserAccount'
import db from '@play-money/database'
import { getMarketLiquidity } from './getMarketLiquidity'
import { getMarketQuote } from './getMarketQuote'

async function getMarketTraderBonusPayouts(marketId: string) {
  const houseAccount = await getHouseAccount()

  const netWorth = await db.transactionItem.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      accountId: { not: houseAccount.id },
      transaction: {
        type: 'MARKET_TRADER_BONUS',
        marketId,
      },
      currencyCode: 'PRIMARY',
    },
  })

  return netWorth._sum.amount ?? new Decimal(0)
}

async function getUserMarketTraderBonusPayouts(marketId: string, userId: string) {
  const netWorth = await db.transactionItem.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      account: {
        userId,
      },
      transaction: {
        type: 'MARKET_TRADER_BONUS',
        marketId,
      },
      currencyCode: 'PRIMARY',
    },
  })

  return netWorth._sum.amount ?? new Decimal(0)
}

async function getUserHeldEarnings({ marketId, userId }: { marketId: string; userId: string }) {
  const userAccount = await getUserAccount({ id: userId })

  // TODO: account for loss subtracing loss transactions
  const primaryBalance = await getAccountBalance({
    accountId: userAccount.id,
    currencyCode: 'PRIMARY',
    marketId,
    includeTransactionTypes: ['MARKET_RESOLVE_WIN'],
  })

  return primaryBalance
}

async function getUserSoldEarnings({ marketId, userId }: { marketId: string; userId: string }) {
  const userAccount = await getUserAccount({ id: userId })
  const primaryBalance = await getAccountBalance({
    accountId: userAccount.id,
    currencyCode: 'PRIMARY',
    marketId,
    includeTransactionTypes: ['MARKET_SELL'],
  })

  return primaryBalance
}

async function getUserMarketPositions({ marketId, userId }: { marketId: string; userId: string }) {
  const userAccount = await getUserAccount({ id: userId })
  const yesBalance = await getAccountBalance({ accountId: userAccount.id, currencyCode: 'YES', marketId })
  const noBalance = await getAccountBalance({ accountId: userAccount.id, currencyCode: 'NO', marketId })
  const yesMarketOption = await db.marketOption.findFirst({
    where: { currencyCode: 'YES', marketId },
  })
  const noMarketOption = await db.marketOption.findFirst({
    where: { currencyCode: 'NO', marketId },
  })

  if (!yesMarketOption || !noMarketOption) {
    throw new Error('No market options')
  }

  const { shares: yesValue } = await getMarketQuote({
    marketId,
    optionId: yesMarketOption.id,
    amount: yesBalance,
    isBuy: false,
  })

  const { shares: noValue } = await getMarketQuote({
    marketId,
    optionId: noMarketOption.id,
    amount: noBalance,
    isBuy: false,
  })

  // TODO: account for each option's cost
  const primaryCost = await getAccountBalance({
    accountId: userAccount.id,
    currencyCode: 'PRIMARY',
    marketId,
    includeTransactionTypes: ['MARKET_BUY'],
  })

  const primarySold = await getAccountBalance({
    accountId: userAccount.id,
    currencyCode: 'PRIMARY',
    marketId,
    includeTransactionTypes: ['MARKET_SELL'],
  })

  return {
    [yesMarketOption.id]: {
      cost: primaryCost.abs().sub(primarySold).toNumber(),
      value: yesValue.toNumber(),
      shares: yesBalance.toNumber(),
      payout: yesBalance.toNumber(),
    },
    [noMarketOption.id]: {
      cost: primaryCost.abs().sub(primarySold).toNumber(),
      value: noValue.toNumber(),
      shares: noBalance.toNumber(),
      payout: noBalance.toNumber(),
    },
  }
}

export async function getMarketStats({ marketId, userId }: { marketId: string; userId?: string }) {
  const [liquidity, traderBonusPayouts, userHoldingsPayout, userMarketPositions, soldEarnings, heldEarnings] =
    await Promise.all([
      getMarketLiquidity(marketId),
      getMarketTraderBonusPayouts(marketId),
      userId ? getUserMarketTraderBonusPayouts(marketId, userId) : undefined,
      userId ? getUserMarketPositions({ marketId, userId }) : undefined,
      userId ? getUserSoldEarnings({ marketId, userId }) : undefined,
      userId ? getUserHeldEarnings({ marketId, userId }) : undefined,
    ])

  return {
    totalLiquidity: liquidity.total,
    lpUserCount: Object.keys(liquidity.providers).length,
    traderBonusPayouts: traderBonusPayouts,
    positions: userMarketPositions,
    earnings: {
      held: heldEarnings?.toNumber(),
      sold: soldEarnings?.toNumber(),
      traderBonusPayouts: userHoldingsPayout?.toNumber(),
    },
  }
}
