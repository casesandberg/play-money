import Decimal from 'decimal.js'
import { getAssetBalance, getBalances } from '@play-money/finance/lib/getBalances'
import { getHouseAccount } from '@play-money/finance/lib/getHouseAccount'
import { getMarketClearingAccount } from '@play-money/markets/lib/getMarketClearingAccount'
import { TransactionItemInput } from './createTransaction'

export async function convertPrimaryToMarketShares({
  fromAccountId,
  amount,
  marketId,
}: {
  fromAccountId: string
  amount: Decimal
  marketId: string
}): Promise<Array<TransactionItemInput>> {
  const exchangerAccount = await getMarketClearingAccount({ marketId })
  const houseAccount = await getHouseAccount()

  if (amount.lte(0)) {
    throw new Error('Exchange amount must be greater than 0')
  }

  const accountPrimaryBalance = await getAssetBalance({
    accountId: fromAccountId,
    assetType: 'CURRENCY',
    assetId: 'PRIMARY',
  })

  if (!accountPrimaryBalance.amount.gte(amount) && fromAccountId !== houseAccount.id) {
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
  marketId,
  inflightTransactionItems,
}: {
  fromAccountId: string
  amount: Decimal
  marketId: string
  inflightTransactionItems?: Array<TransactionItemInput>
}): Promise<Array<TransactionItemInput>> {
  const exchangerAccount = await getMarketClearingAccount({ marketId })

  if (amount.lte(0)) {
    throw new Error('Exchange amount must be greater than 0')
  }

  const balances = await getBalances({
    accountId: fromAccountId,
    marketId,
  })

  const optionBalances = balances.filter(({ assetType }) => assetType === 'MARKET_OPTION')

  // TODO: Fix this with transactions rewrite
  const inflightAdjustments = (inflightTransactionItems || []).reduce(
    (acc, transaction) => {
      if (transaction.accountId === fromAccountId && ['YES', 'NO'].includes(transaction.currencyCode)) {
        const currentAdjustment = acc[transaction.currencyCode] || new Decimal(0)
        acc[transaction.currencyCode] = currentAdjustment.add(transaction.amount)
      }
      return acc
    },
    {} as Record<string, Decimal>
  )

  const hasSufficientShares = optionBalances.every((balance, i) => {
    const inflightAdjustment = inflightAdjustments[i === 0 ? 'YES' : 'NO'] || new Decimal(0)
    console.log(balance.amount, inflightAdjustment, amount)
    return balance.amount.add(inflightAdjustment).gte(amount)
  })

  if (!hasSufficientShares) {
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
