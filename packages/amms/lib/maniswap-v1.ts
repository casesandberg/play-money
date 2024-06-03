import { CurrencyCodeType } from '@play-money/database/zod/inputTypeSchemas/CurrencyCodeSchema'
import { TransactionItemInput } from '@play-money/transactions/lib/createTransaction'
import { convertPrimaryToMarketShares } from '@play-money/transactions/lib/exchanger'
import { getUserById } from '@play-money/users/lib/getUserById'

export async function buy({
  fromAccountId,
  toAccountId,
  currencyCode,
  maxAmount,
  maxProbability,
}: {
  fromAccountId: string
  toAccountId: string
  currencyCode: CurrencyCodeType
  maxAmount: number
  maxProbability?: number
}): Promise<Array<TransactionItemInput>> {
  function costToHitProbability({ maxAmount }: { probability: number; maxAmount: number }) {
    return maxAmount
  }

  const amountToBuy = maxProbability ? costToHitProbability({ probability: maxProbability, maxAmount }) : maxAmount

  const exchangerTransactions = await convertPrimaryToMarketShares({
    fromAccount: fromAccountId,
    amount: amountToBuy,
    toAccount: toAccountId,
  })

  // TODO: Implement AMM.

  const ammTransactions = [
    {
      accountId: toAccountId,
      currencyCode: currencyCode,
      amount: -amountToBuy,
    },
    {
      accountId: fromAccountId,
      currencyCode: currencyCode,
      amount: amountToBuy,
    },
  ]

  return [...exchangerTransactions, ...ammTransactions]
}
