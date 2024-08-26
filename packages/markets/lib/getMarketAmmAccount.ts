import db from '@play-money/database'

export async function getMarketAmmAccount({ marketId }: { marketId: string }) {
  const account = await db.account.findFirst({
    where: {
      type: 'MARKET_AMM',
      marketId,
    },
  })

  if (!account) {
    throw new Error('Market amm account does not exist')
  }

  return account
}
