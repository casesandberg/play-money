import Decimal from 'decimal.js'
import { TransactionClient } from '@play-money/database'
import { AssetTypeType } from '@play-money/database/zod/inputTypeSchemas/AssetTypeSchema'
import { NetBalance } from './getBalances'

export async function updateBalance({
  tx,
  accountId,
  assetType,
  assetId,
  change,
  subtotals,
  marketId,
}: {
  tx: TransactionClient
  accountId: string
  assetType: AssetTypeType
  assetId: string
  change: Decimal
  subtotals: Record<string, number>
  marketId?: string
}) {
  const existingBalance = await tx.balance.findFirst({
    where: {
      accountId,
      assetType,
      assetId,
      marketId: marketId ?? null,
    },
    select: { id: true },
  })

  return tx.balance.upsert({
    where: {
      id: existingBalance?.id ?? '',
    },
    update: {
      total: change.isNegative() ? { decrement: change.abs().toNumber() } : { increment: change.toNumber() },
      subtotals,
    },
    create: {
      accountId,
      assetType,
      assetId,
      total: change,
      marketId: marketId ?? null,
      subtotals,
      createdAt: new Date(),
    },
  }) as unknown as NetBalance
}
