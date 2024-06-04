import { checkAccountBalance } from '@play-money/accounts/lib/checkAccountBalance'
import { TransactionItemInput } from './createTransaction'

export async function convertPrimaryToMarketShares({
  fromAccountId,
  amount,
}: {
  fromAccountId: string
  amount: number
}): Promise<Array<TransactionItemInput>> {
  if (amount <= 0) {
    throw new Error('Exchange amount must be greater than 0')
  }

  const hasEnoughBalance = await checkAccountBalance(fromAccountId, 'PRIMARY', amount)
  if (!hasEnoughBalance) {
    throw new Error('User does not have enough balance.')
  }

  const sharesToCreate = amount

  return [
    {
      accountId: fromAccountId,
      currencyCode: 'PRIMARY',
      amount: -amount,
    },
    {
      accountId: 'EXCHANGER',
      currencyCode: 'PRIMARY',
      amount: amount,
    },
    {
      accountId: 'EXCHANGER',
      currencyCode: 'YES',
      amount: -sharesToCreate,
    },
    {
      accountId: 'EXCHANGER',
      currencyCode: 'NO',
      amount: -sharesToCreate,
    },
    {
      accountId: fromAccountId,
      currencyCode: 'YES',
      amount: sharesToCreate,
    },
    {
      accountId: fromAccountId,
      currencyCode: 'NO',
      amount: sharesToCreate,
    },
  ]
}
