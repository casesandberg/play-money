import { CurrencyCodeType } from '@play-money/database/zod/inputTypeSchemas/CurrencyCodeSchema'
import { TransactionItemInput } from '@play-money/transactions/lib/createTransaction'
import { convertPrimaryToMarketShares } from '@play-money/transactions/lib/exchanger'
import { getUserById } from '@play-money/users/lib/getUserById'

export async function buy({
  fromId,
  toId,
  currencyCode,
  maxAmount,
  maxProbability,
}: {
  fromId: string
  toId: string
  currencyCode: CurrencyCodeType
  maxAmount: number
  maxProbability?: number
}): Promise<Array<TransactionItemInput>> {
  const amm = await getUserById({ id: toId })
  if (!amm) {
    throw new Error('AMM not found')
  }

  function costToHitProbability({ maxAmount }: { probability: number; maxAmount: number }) {
    return maxAmount
  }

  const amountToBuy = maxProbability ? costToHitProbability({ probability: maxProbability, maxAmount }) : maxAmount

  const exchangerTransactions = await convertPrimaryToMarketShares({
    from: fromId,
    amount: amountToBuy,
    to: toId,
  })

  // TODO: Implement AMM.

  const ammTransactions = [
    {
      userId: toId,
      currencyCode: currencyCode,
      amount: -amountToBuy,
    },
    {
      userId: fromId,
      currencyCode: currencyCode,
      amount: amountToBuy,
    },
  ]

  return [...exchangerTransactions, ...ammTransactions]
}
