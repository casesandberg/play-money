import db, { Transaction, TransactionEntry } from '@play-money/database'

export type MarketTransaction = Transaction & {
  entries: Array<TransactionEntry>
}

export async function getMarketTransactions({ marketId }: { marketId: string }) {
  const transactions = await db.transaction.findMany({
    where: {
      marketId: marketId,
    },
    include: {
      entries: true,
    },
  })

  return transactions
}
