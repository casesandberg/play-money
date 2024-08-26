import db, { TransactionClient } from '@play-money/database'
import { TransactionTypeType } from '@play-money/database/zod/inputTypeSchemas/TransactionTypeSchema'
import { BalanceChange, calculateBalanceChanges } from '@play-money/finance/lib/helpers'
import { TransactionEntryInput } from '../types'
import { updateGlobalBalances } from './updateGlobalBalances'

export async function executeTransaction({
  type,
  initiatorId,
  entries,
  marketId,
  optionIds,
  additionalLogic,
}: {
  type: TransactionTypeType
  initiatorId?: string
  entries: Array<TransactionEntryInput>
  marketId?: string
  optionIds?: Array<string>
  additionalLogic?: (params: {
    tx: TransactionClient
    balanceChanges: Array<BalanceChange>
    transactionType: TransactionTypeType
  }) => Promise<unknown>
}) {
  const balanceChanges = calculateBalanceChanges({ entries })

  return db.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        type,
        initiatorId,
        marketId,
        entries: { create: entries },
        options: {
          connect: optionIds?.map((id) => ({ id })),
        },
      },
    })

    await Promise.all([
      updateGlobalBalances({ tx, transactionType: type, balanceChanges }),
      additionalLogic?.({ tx, balanceChanges, transactionType: type }),
    ])

    return transaction
  })
}
