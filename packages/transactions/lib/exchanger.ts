import Decimal from 'decimal.js'
import { checkAccountBalance } from '@play-money/accounts/lib/checkAccountBalance'
import { getExchangerAccount } from '@play-money/accounts/lib/getExchangerAccount'
import { getHouseAccount } from '@play-money/accounts/lib/getHouseAccount'
import { TransactionItemInput } from './createTransaction'

export async function convertPrimaryToMarketShares({
  fromAccountId,
  amount,
}: {
  fromAccountId: string
  amount: Decimal
}): Promise<Array<TransactionItemInput>> {
  const exchangerAccount = await getExchangerAccount()
  const houseAccount = await getHouseAccount()

  if (amount.lte(0)) {
    throw new Error('Exchange amount must be greater than 0')
  }

  const hasEnoughBalance = await checkAccountBalance({ accountId: fromAccountId, currencyCode: 'PRIMARY', amount })
  if (!hasEnoughBalance && fromAccountId !== houseAccount.id) {
    throw new Error('User does not have enough balance.')
  }

  const sharesToCreate = amount

  return [
    {
      accountId: fromAccountId,
      currencyCode: 'PRIMARY',
      amount: amount.neg(),
    },
    {
      accountId: exchangerAccount.id,
      currencyCode: 'PRIMARY',
      amount: amount,
    },
    {
      accountId: exchangerAccount.id,
      currencyCode: 'YES',
      amount: sharesToCreate.neg(),
    },
    {
      accountId: exchangerAccount.id,
      currencyCode: 'NO',
      amount: sharesToCreate.neg(),
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

export async function convertMarketSharesToPrimary({
  fromAccountId,
  amount,
  inflightTransactionItems,
}: {
  fromAccountId: string
  amount: Decimal
  inflightTransactionItems?: Array<TransactionItemInput>
}): Promise<Array<TransactionItemInput>> {
  const exchangerAccount = await getExchangerAccount()

  if (amount.lte(0)) {
    throw new Error('Exchange amount must be greater than 0')
  }

  const hasEnoughYesBalance = await checkAccountBalance({
    accountId: fromAccountId,
    currencyCode: 'YES',
    amount,
    inflightTransactionItems,
  })
  const hasEnoughNoBalance = await checkAccountBalance({
    accountId: fromAccountId,
    currencyCode: 'NO',
    amount,
    inflightTransactionItems,
  })
  if (!hasEnoughYesBalance || !hasEnoughNoBalance) {
    throw new Error('User does not have enough shares.')
  }

  return [
    {
      accountId: fromAccountId,
      currencyCode: 'YES',
      amount: amount.neg(),
    },
    {
      accountId: fromAccountId,
      currencyCode: 'NO',
      amount: amount.neg(),
    },
    {
      accountId: exchangerAccount.id,
      currencyCode: 'YES',
      amount: amount,
    },
    {
      accountId: exchangerAccount.id,
      currencyCode: 'NO',
      amount: amount,
    },

    {
      accountId: fromAccountId,
      currencyCode: 'PRIMARY',
      amount: amount,
    },
    {
      accountId: exchangerAccount.id,
      currencyCode: 'PRIMARY',
      amount: amount.neg(),
    },
  ]
}
