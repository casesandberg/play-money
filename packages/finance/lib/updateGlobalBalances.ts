import Decimal from 'decimal.js'
import { TransactionClient } from '@play-money/database'
import { TransactionTypeType } from '@play-money/database/zod/inputTypeSchemas/TransactionTypeSchema'
import { BalanceChange, calculateBalanceSubtotals } from './helpers'
import { updateBalance } from './updateBalance'

export async function updateGlobalBalances({
  tx,
  transactionType,
  balanceChanges,
}: {
  tx: TransactionClient
  transactionType: TransactionTypeType
  balanceChanges: Array<BalanceChange>
}) {
  await Promise.all(
    balanceChanges.map(async ({ accountId, assetType, assetId, change }) => {
      if (assetType !== 'CURRENCY') {
        return
      }

      const subtotals = await calculateBalanceSubtotals({
        tx,
        accountId,
        assetType,
        assetId,
        change: new Decimal(change),
        transactionType,
      })

      return updateBalance({
        tx,
        accountId,
        assetType,
        assetId,
        subtotals,
        change: new Decimal(change),
      })
    })
  )
}
