import { createComment } from '@play-money/comments/lib/createComment'
import db from '@play-money/database'
import { calculateBalanceChanges } from '@play-money/finance/lib/helpers'
import { updateGlobalBalances } from '@play-money/finance/lib/updateGlobalBalances'
import { isMarketResolved, isMarketCanceled } from '../rules'
import { getMarket } from './getMarket'
import { updateMarketBalances } from './updateMarketBalances'

export async function cancelMarket({
  canceledById,
  marketId,
  reason,
}: {
  canceledById: string
  marketId: string
  reason: string
}) {
  const market = await getMarket({ id: marketId, extended: true })

  if (isMarketResolved({ market })) {
    throw new Error('Market already resolved')
  }

  if (isMarketCanceled({ market })) {
    throw new Error('Market already canceled')
  }

  const transactions = await db.transaction.findMany({
    where: {
      marketId: marketId,
      type: {
        in: [
          'TRADE_BUY',
          'TRADE_SELL',
          'TRADE_WIN',
          'TRADE_LOSS',
          'CREATOR_TRADER_BONUS',
          'LIQUIDITY_INITIALIZE',
          'LIQUIDITY_DEPOSIT',
          'LIQUIDITY_WITHDRAWAL',
          'LIQUIDITY_RETURNED',
          'LIQUIDITY_VOLUME_BONUS',
        ],
      },
      isReverse: null,
    },
    include: {
      entries: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  for (const transaction of transactions) {
    const reverseTransactionExists = await db.transaction.findFirst({
      where: {
        reverseOfId: transaction.id,
      },
    })

    if (reverseTransactionExists) {
      continue
    }

    const { id: _, createdAt: __, updatedAt: ___, ...deconstructedTransaction } = transaction

    await db.$transaction(async (tx) => {
      const reverseTransaction = await tx.transaction.create({
        data: {
          ...deconstructedTransaction,
          isReverse: true,
          reverseOfId: transaction.id,
          entries: {
            createMany: {
              data: transaction.entries.map(
                ({ id: _, transactionId: __, createdAt: ___, fromAccountId, toAccountId, ...entry }) => ({
                  ...entry,
                  fromAccountId: toAccountId,
                  toAccountId: fromAccountId,
                })
              ),
            },
          },
        },
        include: {
          entries: true,
          options: true,
          initiator: true,
        },
      })

      const balanceChanges = calculateBalanceChanges({ entries: reverseTransaction.entries })

      await Promise.all([
        updateGlobalBalances({ tx, transactionType: reverseTransaction.type, balanceChanges }),
        updateMarketBalances({ tx, transactionType: reverseTransaction.type, balanceChanges, marketId }),
      ])
    })
  }

  await db.marketOptionPosition.updateMany({
    where: { marketId },
    data: {
      value: 0,
      cost: 0,
      quantity: 0,
    },
  })

  await db.market.update({
    where: { id: marketId },
    data: { canceledAt: new Date(), canceledById },
  })

  await createComment({
    content: `<p><strong>CANCELATION REASON:</strong><br />${reason}</p>`,
    authorId: canceledById,
    parentId: null,
    entityType: 'MARKET',
    entityId: market.id,
  })
}
