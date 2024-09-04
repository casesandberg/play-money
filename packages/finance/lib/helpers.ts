import Decimal from 'decimal.js'
import { TransactionClient } from '@play-money/database'
import { AssetTypeType } from '@play-money/database/zod/inputTypeSchemas/AssetTypeSchema'
import { calculateProbability } from '../amms/maniswap-v1.1'
import { TransactionEntryInput } from '../types'
import { NetBalance, NetBalanceAsNumbers } from './getBalances'

export type BalanceChange = {
  accountId: string
  assetType: AssetTypeType
  assetId: string
  change: number
}

export function calculateBalanceChanges({ entries }: { entries: Array<TransactionEntryInput> }): Array<BalanceChange> {
  const changes: Record<string, BalanceChange> = {}

  entries.forEach((entry) => {
    const fromKey = `${entry.fromAccountId}-${entry.assetType}-${entry.assetId}`
    const toKey = `${entry.toAccountId}-${entry.assetType}-${entry.assetId}`
    const amount = new Decimal(entry.amount)

    if (fromKey in changes) {
      changes[fromKey].change = new Decimal(changes[fromKey].change).minus(amount).toNumber()
    } else {
      changes[fromKey] = {
        accountId: entry.fromAccountId,
        assetType: entry.assetType,
        assetId: entry.assetId,
        change: amount.negated().toNumber(),
      }
    }

    if (toKey in changes) {
      changes[toKey].change = new Decimal(changes[toKey].change).plus(amount).toNumber()
    } else {
      changes[toKey] = {
        accountId: entry.toAccountId,
        assetType: entry.assetType,
        assetId: entry.assetId,
        change: amount.toNumber(),
      }
    }
  })

  return Object.values(changes)
}

export function findBalanceChange({
  balanceChanges,
  accountId,
  assetType,
  assetId,
}: { balanceChanges: Array<BalanceChange> } & Omit<BalanceChange, 'change'>) {
  return balanceChanges.find((change) => {
    return change.accountId === accountId && change.assetType === assetType && change.assetId === assetId
  })
}

export async function calculateBalanceSubtotals({
  tx,
  accountId,
  assetType,
  assetId,
  change,
  transactionType,
  marketId,
}: {
  tx: TransactionClient
  accountId: string
  assetType: AssetTypeType
  assetId: string
  change: Decimal
  transactionType: string
  marketId?: string
}) {
  const existingBalance = await tx.balance.findFirst({
    where: {
      accountId,
      assetType,
      assetId,
      marketId: marketId ?? null,
    },
    select: { subtotals: true },
  })

  const existingSubtotals = existingBalance?.subtotals as unknown as Record<string, number> | null

  return existingSubtotals
    ? {
        ...existingSubtotals,
        [transactionType]: new Decimal(existingSubtotals[transactionType] || 0).add(change).toNumber(),
      }
    : { [transactionType]: change.toNumber() }
}

export function marketOptionBalancesToProbabilities(balances: Array<NetBalance | NetBalanceAsNumbers> = []) {
  const assetBalances = balances.filter((balance) => balance?.assetType === 'MARKET_OPTION')

  return assetBalances.reduce(
    (result, assetBalance, i) => {
      const probability = calculateProbability({
        index: i,
        shares: assetBalances.map((balance) => balance.total),
      })
        .times(100)
        .toDecimalPlaces(2)
        .toNumber()

      if (isNaN(probability)) {
        result[assetBalance.assetId] = 0
      } else {
        result[assetBalance.assetId] = probability
      }

      return result
    },
    {} as Record<string, number>
  )
}
