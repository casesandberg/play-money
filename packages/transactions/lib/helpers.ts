import Decimal from 'decimal.js'
import { Transaction, TransactionItem } from '@play-money/database'

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
