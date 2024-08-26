import db from '@play-money/database'

export async function getMarketClearingAccount({ marketId }: { marketId: string }) {
  const account = await db.account.findFirst({
    where: {
      type: 'MARKET_CLEARING',
      marketId,
    },
  })

  if (!account) {
    throw new Error('Market clearing account does not exist')
  }

  return account
}
