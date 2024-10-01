import Decimal from 'decimal.js'

/*
 This is currently a _Uniswap_ implementation, not Maniswap, since it does not have a dynamic `p`.
 Instead, the `p` is set at 0.5, which allows us to ignore the exponent (since the actual value of k does not
 matter, as long as the constraint is obeyed)

 For more information, see https://manifoldmarkets.notion.site/Maniswap-ce406e1e897d417cbd491071ea8a0c39
*/

function calculateSellDifference({
  amount,
  targetShareIndex,
  shares,
  amountReturning,
}: {
  amount: Decimal
  targetShareIndex: number
  shares: Array<Decimal>
  amountReturning: Decimal
}) {
  const sharesProduct = multiplyShares(shares)
  return sharesProduct.sub(
    multiplyShares(
      shares.map((share, i) =>
        i === targetShareIndex ? share.sub(amountReturning).plus(amount) : share.sub(amountReturning)
      )
    )
  )
}

function calculateProbabilityCost({
  probability,
  targetShare,
  shares,
  isBuy,
}: {
  probability: Decimal
  targetShare: Decimal
  shares: Array<Decimal>
  isBuy: boolean
}): Decimal {
  const totalShares = sumShares(shares)
  const totalOppositeShares = totalShares.sub(targetShare)

  const factor = isBuy ? probability.neg().div(probability.sub(1)) : probability.sub(1).neg().div(probability)

  if (isBuy) {
    return Decimal.sqrt(totalOppositeShares.times(targetShare).times(probability).neg().div(probability.sub(1))).sub(
      totalOppositeShares
    )
  }

  return Decimal.sqrt(totalOppositeShares.times(targetShare).times(factor)).sub(
    isBuy ? totalOppositeShares : targetShare
  )
}

export function findShareIndex(shares: Array<Decimal>, targetShare: Decimal): number {
  return shares.findIndex((share) => share.eq(targetShare))
}

function sumShares(shares: Array<Decimal | number>) {
  return shares.reduce<Decimal>((sum, share) => sum.add(share), new Decimal(0))
}

function multiplyShares(shares: Array<Decimal>) {
  return shares.reduce((sum, share) => sum.times(share), new Decimal(1))
}

export function calculateProbability({ index, shares }: { index: number; shares: Array<Decimal | number> }): Decimal {
  const indexShares = shares[index]
  const sum = sumShares(shares)

  // The probability for the given index is one minus the share count at the index times the number of dimensions divided by the sum of all shares
  const prob = new Decimal(1).sub(new Decimal(indexShares).mul(shares.length - 1).div(sum))

  // TODO: write tests around this going below 0
  return Decimal.max(prob, 0)
}

function binarySearch(
  evaluate: (mid: Decimal) => Decimal,
  low: Decimal,
  high: Decimal,
  tolerance: Decimal = new Decimal('0.0001'),
  maxIterations: number = 100
): Decimal {
  let iterationCount = 0
  while (high.minus(low).gt(tolerance)) {
    if (iterationCount >= maxIterations) {
      throw new Error('Failed to converge. Max iterations reached.')
    }

    const mid = low.plus(high).div(2)
    const result = evaluate(mid)

    if (result.abs().lte(tolerance)) {
      // If we're very close to zero, favor the upper bound
      return high
    } else if (result.lessThan(0)) {
      low = mid
    } else {
      high = mid
    }

    iterationCount++
  }

  // Return the upper bound to ensure largest possible value
  return high
}

export function trade({
  amount,
  targetShare,
  shares,
  isBuy,
}: {
  amount: Decimal
  targetShare: Decimal
  shares: Array<Decimal>
  isBuy: boolean
}) {
  const targetShareIndex = findShareIndex(shares, targetShare)

  // (num shares of buying) + (amount of currency buying) - (product of all share nums)/(product of for each option, sum of option and the amount of currency buying)
  // When buying x: returnAmount = x + a - xyz/((y+a)(z+a))
  if (isBuy) {
    const sharesProduct = multiplyShares(shares)
    const sharesWithoutTarget = shares.filter((_, i) => i !== targetShareIndex)
    const sharesProductAdded = multiplyShares(sharesWithoutTarget.map((share) => share.plus(amount)))

    return targetShare.plus(amount).sub(sharesProduct.div(sharesProductAdded))
  }

  // When selling n dimensions doesn't have a closed form, so we use binary search to find the amount to sell
  return binarySearch(
    (amountReturning: Decimal) => calculateSellDifference({ amount, targetShareIndex, shares, amountReturning }),
    new Decimal(0),
    amount
  )
}

export async function quote({
  amount,
  probability,
  targetShare,
  shares,
}: {
  amount: Decimal
  probability: Decimal
  targetShare: Decimal
  shares: Array<Decimal>
}): Promise<{ probability: Decimal; newProbabilities: Array<Decimal>; shares: Decimal; cost: Decimal }> {
  const targetIndex = findShareIndex(shares, targetShare)
  const currentProbability = calculateProbability({ index: targetIndex, shares })
  const isBuy = currentProbability.lt(probability)

  let costToHitProbability = calculateProbabilityCost({ probability, targetShare, shares, isBuy })
  const cost = Decimal.min(costToHitProbability, amount)

  const returnedShares = trade({ amount: cost, targetShare, shares, isBuy })

  const updatedShares = shares.map((share, i) =>
    i === targetIndex ? share.sub(returnedShares).add(cost) : isBuy ? share.add(cost) : share.sub(returnedShares)
  )

  return {
    probability: calculateProbability({
      index: targetIndex,
      shares: updatedShares,
    }),
    newProbabilities: updatedShares.map((_prob, i) =>
      calculateProbability({
        index: i,
        shares: updatedShares,
      })
    ),
    shares: returnedShares,
    cost,
  }
}

export function addLiquidity({
  amount,
  options,
}: {
  amount: Decimal
  options: Array<{ shares: Decimal; liquidityProbability: Decimal }>
}): Array<{ newShares: Decimal; liquidityProbability: Decimal }> {
  const denominator = options.reduce((sum, option) => {
    return sum.add(option.liquidityProbability.mul(option.shares).div(option.shares.add(amount)))
  }, new Decimal(0))

  return options.map(({ shares, liquidityProbability }) => {
    return {
      newShares: amount,
      liquidityProbability: liquidityProbability.mul(shares).div(shares.add(amount)).div(denominator),
    }
  })
}
