import Decimal from 'decimal.js'
import db, { TransactionItem } from '@play-money/database'
import { CurrencyCodeType } from '@play-money/database/zod/inputTypeSchemas/CurrencyCodeSchema'
import { getMarket } from '@play-money/markets/lib/getMarket'

// This file is a shim until the financial rewrite is done. Balances will be
// stored in the database and will not require fetching all transactions to calculate.

async function getAccountTransactions({
  accountId,
  currencyCode,
  marketId,
  excludeTransactionTypes,
  includeTransactionTypes,
}: {
  accountId: string
  currencyCode: CurrencyCodeType
  marketId?: string
  excludeTransactionTypes?: string[]
  includeTransactionTypes?: string[]
}) {
  const transactionItems = await db.transactionItem.findMany({
    where: {
      accountId,
      currencyCode,
      transaction: {
        marketId,
        type: {
          notIn: excludeTransactionTypes,
          in: includeTransactionTypes,
        },
      },
    },
    include: {
      transaction: {
        select: { marketId: true, type: true },
      },
    },
  })

  return transactionItems
}

function sumDebitCredit(transactionItems: Array<TransactionItem>) {
  return transactionItems.reduce(
    (acc, item) => {
      if (item.amount.isNegative()) {
        acc.credit = acc.credit.plus(item.amount.abs())
      } else {
        acc.debit = acc.debit.plus(item.amount)
      }
      return acc
    },
    {
      debit: new Decimal(0),
      credit: new Decimal(0),
    }
  )
}

function calculateSubtotals(transactionItems: Array<TransactionItem & { transaction: { type: string } }>) {
  return transactionItems.reduce(
    (acc, item) => {
      const { type } = item.transaction
      if (!acc[type]) {
        acc[type] = { debit: new Decimal(0), credit: new Decimal(0) }
      }
      if (item.amount.isNegative()) {
        acc[type].credit = acc[type].credit.plus(item.amount.abs())
      } else {
        acc[type].debit = acc[type].debit.plus(item.amount)
      }
      return acc
    },
    {} as Record<string, { debit: Decimal; credit: Decimal }>
  )
}

function calculateNetSubtotals(
  subtotals: Record<string, { debit: Decimal; credit: Decimal }>
): Record<string, Decimal> {
  return Object.entries(subtotals).reduce(
    (acc, [key, { debit, credit }]) => {
      acc[key] = debit.minus(credit)
      return acc
    },
    {} as Record<string, Decimal>
  )
}

function createBalanceItem(
  transactionItems: Array<TransactionItem & { transaction: { type: string } }>,
  accountId: string,
  assetType: 'CURRENCY' | 'MARKET_OPTION',
  assetId: string
): NetBalance {
  const totalDC = sumDebitCredit(transactionItems)
  const subtotals = calculateSubtotals(transactionItems)
  const netSubtotals = calculateNetSubtotals(subtotals)

  return {
    accountId,
    assetType,
    assetId,
    amount: totalDC.debit.sub(totalDC.credit),
    subtotals: netSubtotals,
  }
}

export type NetBalance = {
  accountId: string
  assetType: 'CURRENCY' | 'MARKET_OPTION'
  assetId: string
  amount: Decimal
  subtotals: Record<string, Decimal>
}

// Used currently for client applications
export type NetBalanceAsNumbers = {
  accountId: string
  assetType: 'CURRENCY' | 'MARKET_OPTION'
  assetId: string
  amount: number
  subtotals: Record<string, number>
}

export async function getBalances({ accountId, marketId }: { accountId: string; marketId?: string }) {
  const market = marketId ? await getMarket({ id: marketId, extended: true }) : undefined
  const [yesTransactions, noTransactions, primaryTransactions] = await Promise.all([
    market ? getAccountTransactions({ accountId, currencyCode: 'YES', marketId }) : undefined,
    market ? getAccountTransactions({ accountId, currencyCode: 'NO', marketId }) : undefined,
    getAccountTransactions({
      accountId,
      currencyCode: 'PRIMARY',
      marketId,
      excludeTransactionTypes: [
        'DAILY_TRADE_BONUS',
        'DAILY_COMMENT_BONUS',
        'DAILY_MARKET_BONUS',
        'DAILY_LIQUIDITY_BONUS',
      ],
    }),
  ])

  const balances = [createBalanceItem(primaryTransactions, accountId, 'CURRENCY', 'PRIMARY')]

  const yesOptionId = market?.options.find(({ currencyCode }) => currencyCode === 'YES')!.id
  const noOptionId = market?.options.find(({ currencyCode }) => currencyCode === 'NO')!.id

  if (yesOptionId && yesTransactions) {
    balances.push(createBalanceItem(yesTransactions, accountId, 'MARKET_OPTION', yesOptionId))
  }

  if (noOptionId && noTransactions) {
    balances.push(createBalanceItem(noTransactions, accountId, 'MARKET_OPTION', noOptionId))
  }

  return balances
}

export function transformBalancesToNumbers(balances: Array<NetBalance> = []): Array<NetBalanceAsNumbers> {
  return balances.map((balance) => ({
    ...balance,
    amount: balance.amount.toNumber(),
    subtotals: Object.fromEntries(Object.entries(balance.subtotals).map(([key, value]) => [key, value.toNumber()])),
  }))
}

export async function getAssetBalance({
  accountId,
  marketId,
  assetType,
  assetId,
}: {
  accountId: string
  marketId?: string
  assetType: 'CURRENCY' | 'MARKET_OPTION'
  assetId: string
}) {
  const market = marketId ? await getMarket({ id: marketId, extended: true }) : undefined

  const yesOption = market?.options.find(({ currencyCode }) => currencyCode === 'YES')!.id
  const noOption = market?.options.find(({ currencyCode }) => currencyCode === 'NO')!.id

  const transactions =
    assetType === 'CURRENCY'
      ? await getAccountTransactions({ accountId, currencyCode: 'PRIMARY', marketId })
      : await getAccountTransactions({ accountId, currencyCode: assetId === yesOption ? 'YES' : 'NO', marketId })

  return createBalanceItem(transactions, accountId, assetType, assetId)
}

export async function getAssetCost({
  accountId,
  marketId,
  optionId,
}: {
  accountId: string
  marketId: string
  optionId: string
}) {
  const market = await getMarket({ id: marketId, extended: true })
  const currencyCode = market.options.find((option) => option.id === optionId)?.currencyCode

  if (!currencyCode || (currencyCode !== 'YES' && currencyCode !== 'NO')) {
    throw new Error('Invalid optionId')
  }
  const transactions = await db.transaction.findMany({
    where: {
      creatorId: accountId,
      marketId: marketId,
      type: { in: ['MARKET_BUY', 'MARKET_SELL'] },
    },
    include: {
      transactionItems: true,
    },
  })

  const totalCost = transactions.reduce((sum, transaction) => {
    const optionItems = transaction.transactionItems.filter(
      (item) => item.currencyCode === currencyCode && item.accountId === accountId
    )
    const optionSum = optionItems.reduce((itemSum, item) => itemSum.plus(item.amount), new Decimal(0))

    if (optionSum.greaterThan(0)) {
      const primaryItem = transaction.transactionItems.find((item) => item.currencyCode === 'PRIMARY')
      return sum.plus(primaryItem ? primaryItem.amount : 0)
    } else if (optionSum.lessThan(0)) {
      const primaryItem = transaction.transactionItems.find((item) => item.currencyCode === 'PRIMARY')
      return sum.minus(primaryItem ? primaryItem.amount : 0)
    }

    return sum
  }, new Decimal(0))

  return totalCost
}
