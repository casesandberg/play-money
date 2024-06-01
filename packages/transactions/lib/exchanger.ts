import { TransactionItemInput } from './createTransaction'
import { checkUserBalance } from './getUserBalances'

export async function convertPrimaryToMarketShares({
  from,
  amount,
  to,
}: {
  from: string
  amount: number
  to: string
}): Promise<Array<TransactionItemInput>> {
  if (amount <= 0) {
    throw new Error('Exchange amount must be greater than 0')
  }

  const hasEnoughBalance = await checkUserBalance(from, 'PRIMARY', amount)
  if (!hasEnoughBalance) {
    throw new Error('User does not have enough balance to exchange.')
  }

  const sharesToCreate = amount

  return [
    {
      userId: from,
      currencyCode: 'PRIMARY',
      amount: -amount,
    },
    {
      userId: 'EXCHANGER',
      currencyCode: 'PRIMARY',
      amount: amount,
    },
    {
      userId: 'EXCHANGER',
      currencyCode: 'YES',
      amount: -sharesToCreate,
    },
    {
      userId: 'EXCHANGER',
      currencyCode: 'NO',
      amount: -sharesToCreate,
    },
    {
      userId: to,
      currencyCode: 'YES',
      amount: sharesToCreate,
    },
    {
      userId: to,
      currencyCode: 'NO',
      amount: sharesToCreate,
    },
  ]
}
