import db from '@play-money/database'

export async function getMarketClearingAccount({ marketId }: { marketId: string }) {
  const account = await db.account.findUnique({
    where: {
      internalType: 'EXCHANGER',
    },
  })

  if (!account) {
    throw new Error('Exchanger account does not exist')
  }

  return account
}
