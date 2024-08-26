import db from '@play-money/database'
import { getHouseAccount } from '@play-money/finance/lib/getHouseAccount'
import { TransactionWithEntries } from '@play-money/finance/types'

export async function getNewLiquidityTransactions(): Promise<Array<TransactionWithEntries>> {
  const houseAccount = await getHouseAccount()
  const transactions = await db.transaction.findMany({
    where: {
      type: 'LIQUIDITY_DEPOSIT',
      entries: {
        none: {
          fromAccountId: houseAccount.id,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      entries: true,
      market: true,
      initiator: true,
      options: true,
    },
  })

  return transactions
}
