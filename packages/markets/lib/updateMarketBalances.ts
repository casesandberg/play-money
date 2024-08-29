import Decimal from 'decimal.js'
import { TransactionClient } from '@play-money/database'
import { TransactionTypeType } from '@play-money/database/zod/inputTypeSchemas/TransactionTypeSchema'
import { BalanceChange, calculateBalanceSubtotals } from '@play-money/finance/lib/helpers'
import { updateBalance } from '@play-money/finance/lib/updateBalance'

export async function updateMarketBalances({
  tx,
  transactionType,
  balanceChanges,
  marketId,
}: {
  tx: TransactionClient
  transactionType: TransactionTypeType
  balanceChanges: Array<BalanceChange>
  marketId: string
}) {
  await Promise.all(
    balanceChanges.map(async ({ accountId, assetType, assetId, change }) => {
      const subtotals = await calculateBalanceSubtotals({
        tx,
        accountId,
        assetType,
        assetId,
        change: new Decimal(change),
        transactionType,
        marketId,
      })

      return updateBalance({
        tx,
        accountId,
        assetType,
        assetId,
        subtotals,
        change: new Decimal(change),
        marketId,
      })
    })
  )
}
