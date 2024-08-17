import db, { Transaction, TransactionItem } from '@play-money/database'

export type MarketTransaction = Transaction & {
  transactionItems: Array<TransactionItem>
}

export async function getMarketTransactions({ marketId }: { marketId: string }) {
  const transactions = await db.transaction.findMany({
    where: {
      marketId: marketId,
    },
    include: {
      transactionItems: true,
    },
  })

  return transactions
}
