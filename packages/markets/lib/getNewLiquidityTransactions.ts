import db from '@play-money/database'
import { getHouseAccount } from '@play-money/finance/lib/getHouseAccount'
import { TransactionWithItems } from '@play-money/finance/lib/getTransactions'

export async function getNewLiquidityTransactions(): Promise<Array<TransactionWithItems>> {
  const houseAccount = await getHouseAccount()

  // TODO: Come up with a better fix to ignore the funding transaction of a market
  const ignoreFirstTransactionPerMarket = (
    await db.transaction.findMany({
      where: {
        type: 'MARKET_LIQUIDITY',
      },
      orderBy: {
        createdAt: 'asc',
      },
      distinct: ['marketId'],
      select: {
        id: true,
      },
    })
  ).map(({ id }) => id)

  const transactions = await db.transaction.findMany({
    where: {
      creator: {
        userId: {
          notIn: [houseAccount.id],
        },
      },
      type: 'MARKET_LIQUIDITY',
      id: {
        notIn: ignoreFirstTransactionPerMarket,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      transactionItems: true,
      market: true,
      creator: {
        include: {
          user: true,
        },
      },
    },
  })

  return transactions
}
