import { CurrencyCodeType } from '@play-money/database/zod/inputTypeSchemas/CurrencyCodeSchema'
import { TransactionItemInput } from '@play-money/transactions/lib/createTransaction'

export async function buy({
  fromAccountId,
  ammAccountId,
  currencyCode,
  amount,
}: {
  fromAccountId: string
  ammAccountId: string
  currencyCode: CurrencyCodeType
  amount: number
}): Promise<Array<TransactionItemInput>> {
  const oppositeCurrencyCode: CurrencyCodeType = currencyCode === 'YES' ? 'NO' : 'YES'

  // TODO: Implement AMM.

  const ammTransactions = [
    // Giving the shares to the AMM.
    {
      accountId: fromAccountId,
      currencyCode: currencyCode,
      amount: -amount,
    },
    {
      accountId: fromAccountId,
      currencyCode: oppositeCurrencyCode,
      amount: -amount,
    },
    {
      accountId: ammAccountId,
      currencyCode: currencyCode,
      amount: amount,
    },
    {
      accountId: ammAccountId,
      currencyCode: oppositeCurrencyCode,
      amount: amount,
    },

    // Returning purchased shares to the user.
    {
      accountId: ammAccountId,
      currencyCode: currencyCode,
      amount: -amount,
    },
    {
      accountId: fromAccountId,
      currencyCode: currencyCode,
      amount: amount,
    },
  ]

  return ammTransactions
}

export async function costToHitProbability({ maxAmount }: { probability: number; maxAmount: number }) {
  // TODO: Calculate given shares in AMM pool.
  return maxAmount
}
