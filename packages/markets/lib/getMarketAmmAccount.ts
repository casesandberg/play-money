import db from '@play-money/database'

export async function getMarketAmmAccount({ marketId }: { marketId: string }) {
  const market = await db.market.findUnique({
    where: {
      id: marketId,
    },
    include: {
      accounts: true,
    },
  })

  if (!market) {
    throw new Error(`Market with id "${marketId}" not found`)
  }

  const account = market.accounts[0]

  if (!account) {
    throw new Error('Market does not have an account')
  }

  return account
}
