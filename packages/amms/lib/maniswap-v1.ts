import { getAccountBalance } from '@play-money/accounts/lib/getAccountBalance'
import { CurrencyCodeType } from '@play-money/database/zod/inputTypeSchemas/CurrencyCodeSchema'
import { TransactionItemInput } from '@play-money/transactions/lib/createTransaction'

/*
 This is currently a _Uniswap_ implementation, not Maniswap, since it does not have a dynamic `p`.
 Instead, the `p` is set at 0.5, which allows us to ignore the exponent (since the actual value of k does not
 matter, as long as the constraint is obeyed)

 For more information, see https://manifoldmarkets.notion.site/Maniswap-ce406e1e897d417cbd491071ea8a0c39
*/
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
  const buyingYes = currencyCode === 'YES'
  const oppositeCurrencyCode: CurrencyCodeType = buyingYes ? 'NO' : 'YES'

  const y = await getAccountBalance(ammAccountId, 'YES')
  const n = await getAccountBalance(ammAccountId, 'NO')

  let toReturn: number
  if (buyingYes) {
    // We will solve (y + amount - toReturn) * (n + amount) = k = y * n for toReturn
    toReturn = (amount * (amount + n + y)) / (amount + n)
  } else {
    // We will solve (y + amount) * (n + amount - toReturn) = k = y * n for toReturn
    toReturn = (amount * (amount + n + y)) / (amount + y)
  }

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
      amount: -toReturn,
    },
    {
      accountId: fromAccountId,
      currencyCode: currencyCode,
      amount: toReturn,
    },
  ]

  return ammTransactions
}

export async function sell({
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
  const sellingYes = currencyCode === 'YES'
  const oppositeCurrencyCode: CurrencyCodeType = sellingYes ? 'NO' : 'YES'

  const y = await getAccountBalance(ammAccountId, 'YES')
  const n = await getAccountBalance(ammAccountId, 'NO')

  let toReturn: number
  if (sellingYes) {
    // We will solve (y + amount - toReturn) * (n - toReturn) = k = y * n for toReturn
    toReturn = 0.5 * (n + y + amount - Math.sqrt(Math.pow(n + amount + y, 2) - 4 * n * amount))
  } else {
    // We will solve (y + amount - toReturn) * (n - toReturn) = k = y * n for toReturn
    toReturn = 0.5 * (n + y + amount - Math.sqrt(Math.pow(n + amount + y, 2) - 4 * y * amount))
  }

  return [
    // Giving the shares to the AMM.
    {
      accountId: fromAccountId,
      currencyCode: currencyCode,
      amount: -amount,
    },
    {
      accountId: ammAccountId,
      currencyCode: currencyCode,
      amount: amount,
    },

    // Returning purchased shares to the user.
    {
      accountId: fromAccountId,
      currencyCode: currencyCode,
      amount: toReturn,
    },
    {
      accountId: fromAccountId,
      currencyCode: oppositeCurrencyCode,
      amount: toReturn,
    },
    {
      accountId: ammAccountId,
      currencyCode: currencyCode,
      amount: -toReturn,
    },
    {
      accountId: ammAccountId,
      currencyCode: oppositeCurrencyCode,
      amount: -toReturn,
    },
  ]
}

export async function costToHitProbability({
  ammAccountId,
  probability,
  maxAmount,
}: {
  ammAccountId: string
  probability: number
  maxAmount: number
}) {
  const y = await getAccountBalance(ammAccountId, 'YES')
  const n = await getAccountBalance(ammAccountId, 'NO')

  const currentProbability = n / (y + n)

  let cost: number
  let returnedShares: number
  if (currentProbability < probability) {
    // Buying YES, so NO shares will increase, and YES shares will decrease, to maintain the AMM constraint.
    // The amount of added NO shares will be the cost, since that's the number of shares that need to be created.

    // That is, we solve given the following two equations:
    // probability = (n + cost) / (y - removedYes + n + cost)
    // y * n = k = (y - removedYes) * (n + cost)

    // Per WolframAlpha, this gives us:
    cost = Math.sqrt(-(n * y * probability) / (probability - 1)) - n
    const removedYes = y - (n * y) / (cost + n)
    returnedShares = removedYes + cost

    if (cost > maxAmount) {
      cost = maxAmount
      returnedShares = (cost * (cost + n + y)) / (cost + n)
    }
  } else {
    // Buying NO, so YES shares will increase, and NO shares will decrease, to maintain the AMM constraint.
    // The amount of added YES shares will be the cost, since that's the number of shares that need to be created.

    // That is, we solve given the following two equations:
    // probability = (n - removedNo) / (y + cost + n - removedNo)
    // y * n = k = (n - removedNo) * (y + cost)

    // Per WolframAlpha, this gives us:
    cost = Math.sqrt(-(n * y * (probability - 1)) / probability) - y
    const removedNo = n - (n * y) / (cost + y)
    returnedShares = removedNo + cost

    if (cost > maxAmount) {
      cost = maxAmount
      returnedShares = (cost * (cost + n + y)) / (cost + y)
    }
  }

  return {
    cost: cost,
    returnedShares: returnedShares,
  }
}
