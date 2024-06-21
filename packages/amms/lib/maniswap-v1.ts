import Decimal from 'decimal.js'
import { getAccountBalance } from '@play-money/accounts/lib/getAccountBalance'
import { CurrencyCodeType } from '@play-money/database/zod/inputTypeSchemas/CurrencyCodeSchema'
import { TransactionItemInput } from '@play-money/transactions/lib/createTransaction'

/*
 This is currently a _Uniswap_ implementation, not Maniswap, since it does not have a dynamic `p`.
 Instead, the `p` is set at 0.5, which allows us to ignore the exponent (since the actual value of k does not
 matter, as long as the constraint is obeyed)

 For more information, see https://manifoldmarkets.notion.site/Maniswap-ce406e1e897d417cbd491071ea8a0c39
*/
function calculateBuyShares(amount: Decimal, y: Decimal, n: Decimal): Decimal {
  return amount.times(amount.add(n).add(y)).div(amount.add(n))
}

function calculateSellShares(amount: Decimal, y: Decimal, n: Decimal): Decimal {
  const totalShares = n.add(y).add(amount)
  return totalShares.sub(Decimal.sqrt(totalShares.pow(2).sub(n.times(4).times(amount)))).times(0.5)
}

function calculateNewProbability(y: Decimal, n: Decimal): Decimal {
  return n.div(y.add(n))
}

export async function buy({
  fromAccountId,
  ammAccountId,
  currencyCode,
  amount,
}: {
  fromAccountId: string
  ammAccountId: string
  currencyCode: CurrencyCodeType
  amount: Decimal
}): Promise<Array<TransactionItemInput>> {
  const buyingYes = currencyCode === 'YES'
  const oppositeCurrencyCode: CurrencyCodeType = buyingYes ? 'NO' : 'YES'

  const y = await getAccountBalance(ammAccountId, 'YES')
  const n = await getAccountBalance(ammAccountId, 'NO')

  const toReturn = buyingYes ? calculateBuyShares(amount, y, n) : calculateBuyShares(amount, n, y)

  const ammTransactions = [
    // Giving the shares to the AMM.
    { accountId: fromAccountId, currencyCode: currencyCode, amount: amount.neg() },
    { accountId: fromAccountId, currencyCode: oppositeCurrencyCode, amount: amount.neg() },
    { accountId: ammAccountId, currencyCode: currencyCode, amount: amount },
    { accountId: ammAccountId, currencyCode: oppositeCurrencyCode, amount: amount },

    // Returning purchased shares to the user.
    { accountId: ammAccountId, currencyCode: currencyCode, amount: toReturn.neg() },
    { accountId: fromAccountId, currencyCode: currencyCode, amount: toReturn },
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
  amount: Decimal
}): Promise<Array<TransactionItemInput>> {
  const sellingYes = currencyCode === 'YES'
  const oppositeCurrencyCode: CurrencyCodeType = sellingYes ? 'NO' : 'YES'

  const y = await getAccountBalance(ammAccountId, 'YES')
  const n = await getAccountBalance(ammAccountId, 'NO')

  const toReturn = sellingYes ? calculateSellShares(amount, y, n) : calculateSellShares(amount, n, y)

  return [
    // Giving the shares to the AMM.
    { accountId: fromAccountId, currencyCode: currencyCode, amount: amount.neg() },
    { accountId: ammAccountId, currencyCode: currencyCode, amount: amount },

    // Returning purchased shares to the user.
    { accountId: fromAccountId, currencyCode: currencyCode, amount: toReturn },
    { accountId: fromAccountId, currencyCode: oppositeCurrencyCode, amount: toReturn },
    { accountId: ammAccountId, currencyCode: currencyCode, amount: toReturn.neg() },
    { accountId: ammAccountId, currencyCode: oppositeCurrencyCode, amount: toReturn.neg() },
  ]
}

export async function quote({
  ammAccountId,
  currencyCode,
  amount,
  isBuy,
}: {
  ammAccountId: string
  currencyCode: CurrencyCodeType
  amount: Decimal
  isBuy: boolean
}): Promise<{ probability: Decimal; shares: Decimal }> {
  const y = await getAccountBalance(ammAccountId, 'YES')
  const n = await getAccountBalance(ammAccountId, 'NO')

  let shares: Decimal
  let newY: Decimal
  let newN: Decimal

  if (isBuy) {
    if (currencyCode === 'YES') {
      shares = calculateBuyShares(amount, y, n)
      newY = y.add(amount).minus(shares)
      newN = n.add(amount)
    } else {
      shares = calculateBuyShares(amount, n, y)
      newN = n.add(amount).minus(shares)
      newY = y.add(amount)
    }
  } else {
    if (currencyCode === 'YES') {
      shares = calculateSellShares(amount, y, n)
      newY = y.add(amount)
      newN = n.sub(shares)
    } else {
      shares = calculateSellShares(amount, n, y)
      newN = n.add(amount)
      newY = y.sub(shares)
    }
  }

  return {
    probability: calculateNewProbability(newY, newN),
    shares,
  }
}

export async function costToHitProbability({
  ammAccountId,
  probability,
  maxAmount,
}: {
  ammAccountId: string
  probability: Decimal
  maxAmount: Decimal
}) {
  const y = await getAccountBalance(ammAccountId, 'YES')
  const n = await getAccountBalance(ammAccountId, 'NO')

  const currentProbability = n.div(y.add(n))

  let cost: Decimal
  let returnedShares: Decimal
  if (currentProbability.lt(probability)) {
    // Buying YES, so NO shares will increase, and YES shares will decrease, to maintain the AMM constraint.
    // The amount of added NO shares will be the cost, since that's the number of shares that need to be created.

    // That is, we solve given the following two equations:
    // probability = (n + cost) / (y - removedYes + n + cost)
    // y * n = k = (y - removedYes) * (n + cost)

    // Per WolframAlpha, this gives us:
    cost = Decimal.sqrt(n.times(y).times(probability).neg().div(probability.sub(1))).sub(n)
    const removedYes = y.sub(n.times(y).div(cost.add(n)))
    returnedShares = removedYes.add(cost)

    if (cost.gt(maxAmount)) {
      cost = maxAmount
      returnedShares = cost.times(cost.add(n).add(y)).div(cost.add(n))
    }
  } else {
    // Buying NO, so YES shares will increase, and NO shares will decrease, to maintain the AMM constraint.
    // The amount of added YES shares will be the cost, since that's the number of shares that need to be created.

    // That is, we solve given the following two equations:
    // probability = (n - removedNo) / (y + cost + n - removedNo)
    // y * n = k = (n - removedNo) * (y + cost)

    // Per WolframAlpha, this gives us:
    cost = Decimal.sqrt(n.times(y).times(probability.sub(1)).neg().div(probability)).sub(y)
    const removedNo = n.sub(n.times(y).div(cost.add(y)))
    returnedShares = removedNo.add(cost)

    if (cost.gt(maxAmount)) {
      cost = maxAmount
      returnedShares = cost.times(cost.add(n).add(y)).div(cost.add(y))
    }
  }

  return {
    cost: cost,
    returnedShares: returnedShares,
  }
}

export async function addLiquidity({
  fromAccountId,
  ammAccountId,
  amount,
}: {
  fromAccountId: string
  ammAccountId: string
  amount: Decimal
}): Promise<Array<TransactionItemInput>> {
  return [
    // Giving the shares to the AMM.
    {
      accountId: fromAccountId,
      currencyCode: 'YES',
      amount: amount.neg(),
    },
    {
      accountId: ammAccountId,
      currencyCode: 'YES',
      amount: amount,
    },
    {
      accountId: fromAccountId,
      currencyCode: 'NO',
      amount: amount.neg(),
    },
    {
      accountId: ammAccountId,
      currencyCode: 'NO',
      amount: amount,
    },

    // Transfer LP bonus
    {
      accountId: ammAccountId,
      currencyCode: 'LPB',
      amount: amount.neg(),
    },
    {
      accountId: fromAccountId,
      currencyCode: 'LPB',
      amount: amount,
    },
  ]
}
