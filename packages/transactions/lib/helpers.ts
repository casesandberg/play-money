import Decimal from 'decimal.js'
import { TransactionWithItems } from './getTransactions'

type HoldingsSummary = {
  [accountId: string]: {
    [currencyCode: string]: Decimal
  }
}

export function summarizeTransaction(transaction: TransactionWithItems): HoldingsSummary {
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
