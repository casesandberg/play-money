import Decimal from 'decimal.js'
import { Transaction, TransactionItem } from '@play-money/database'
import { NetBalanceAsNumbers } from './getBalances'

export function marketOptionBalancesToProbabilities(balances: Array<NetBalanceAsNumbers> = []) {
  const assetBalances = balances.filter(({ assetType }) => assetType === 'MARKET_OPTION')
  const sum = assetBalances.reduce((sum, balance) => sum + (balance.amount || 0), 0)

  return assetBalances.reduce(
    (result, assetBalance) => {
      result[assetBalance.assetId] = Math.round(((sum - assetBalance.amount) / sum) * 100)
      return result
    },
    {} as Record<string, number>
  )
}

type HoldingsSummary = {
  [accountId: string]: {
    [currencyCode: string]: Decimal
  }
}

export function summarizeTransaction(
  transaction: Transaction & { transactionItems: Array<TransactionItem> }
): HoldingsSummary {
  const summary: HoldingsSummary = {}

  for (const item of transaction.transactionItems) {
    const { accountId, currencyCode, amount } = item

    if (!summary[accountId]) {
      summary[accountId] = {}
    }

    if (!summary[accountId][currencyCode]) {
      summary[accountId][currencyCode] = new Decimal(0)
    }

    summary[accountId][currencyCode] = summary[accountId][currencyCode].plus(amount)
  }

  return summary
}
