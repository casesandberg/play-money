import Decimal from 'decimal.js'
import { TransactionClient } from '@play-money/database'
import { AssetTypeType } from '@play-money/database/zod/inputTypeSchemas/AssetTypeSchema'
import { calculateProbability } from '../amms/maniswap-v1.1'
import { REALIZED_GAINS_TAX } from '../economy'
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

  const shares = assetBalances.map((balance) => balance.total)
  const probabilities = assetBalances.map((_assetBalance, i) => {
    return calculateProbability({ index: i, shares })
  })

  const distributed = distributeRemainder(probabilities)

  return assetBalances.reduce(
    (result, assetBalance, i) => {
      result[assetBalance.assetId] = distributed[i].toNumber()

      return result
    },
    {} as Record<string, number>
  )
}

export function distributeRemainder(arr: Array<Decimal>) {
  if (!arr.length) {
    return []
  }
  const total = arr.reduce<Decimal>((a, b) => a.plus(b), new Decimal(0))
  const exactPercentages = arr.map((num) => num.div(total).times(100))

  const floored = exactPercentages.map((v) => Decimal.floor(v))
  const remainders = exactPercentages.map((num, i) => num.sub(floored[i]))

  const flooredSum = floored.reduce((a, b) => a.plus(b), new Decimal(0))

  let remainderToDistribute = new Decimal(100).sub(flooredSum)

  while (remainderToDistribute.gt(0)) {
    const maxIndex = remainders.findIndex((rem) => rem.eq(Decimal.max(...remainders)))
    floored[maxIndex] = floored[maxIndex].plus(1)
    remainders[maxIndex] = new Decimal(0)
    remainderToDistribute = remainderToDistribute.sub(1)
  }

  return floored
}

export function calculateRealizedGainsTax({ cost, salePrice }: { cost: Decimal; salePrice: Decimal }) {
  const gainOrLoss = salePrice.sub(cost)

  if (gainOrLoss.isNegative()) {
    return new Decimal(0) // Assuming no tax is applied for a loss scenario
  }

  return gainOrLoss.times(REALIZED_GAINS_TAX).toDecimalPlaces(4)
}
