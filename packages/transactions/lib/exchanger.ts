import { checkAccountBalance } from '@play-money/accounts/lib/checkAccountBalance'
import { TransactionItemInput } from './createTransaction'

export async function convertPrimaryToMarketShares({
  fromAccount,
  amount,
  toAccount,
}: {
  fromAccount: string
  amount: number
  toAccount: string
}): Promise<Array<TransactionItemInput>> {
  if (amount <= 0) {
    throw new Error('Exchange amount must be greater than 0')
  }

  const hasEnoughBalance = await checkAccountBalance(fromAccount, 'PRIMARY', amount)
  if (!hasEnoughBalance) {
    throw new Error('User does not have enough balance to exchange.')
  }

  const sharesToCreate = amount

  return [
    {
      accountId: fromAccount,
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
      accountId: toAccount,
      currencyCode: 'YES',
      amount: sharesToCreate,
    },
    {
      accountId: toAccount,
      currencyCode: 'NO',
      amount: sharesToCreate,
    },
  ]
}
