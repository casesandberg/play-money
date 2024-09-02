import Decimal from 'decimal.js'

/*
 This is currently a _Uniswap_ implementation, not Maniswap, since it does not have a dynamic `p`.
 Instead, the `p` is set at 0.5, which allows us to ignore the exponent (since the actual value of k does not
 matter, as long as the constraint is obeyed)

 For more information, see https://manifoldmarkets.notion.site/Maniswap-ce406e1e897d417cbd491071ea8a0c39
*/

function getSellDifference({
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

function calculateTrade({
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
  const sharesWithoutTarget = shares.filter((_, i) => i !== targetShareIndex)

  if (isBuy) {
    const sharesProduct = multiplyShares(shares)
    const sharesProductAdded = multiplyShares(sharesWithoutTarget.map((share) => share.plus(amount)))

    return targetShare.plus(amount).sub(sharesProduct.div(sharesProductAdded))
  }

  let lowerBound = new Decimal(0)
  let upperBound = amount
  let amountReturning = lowerBound.plus(upperBound).div(2)
  let difference = getSellDifference({ amount, targetShareIndex, shares, amountReturning })

  let iterationCount = 0

  while (upperBound.minus(lowerBound).gt(0.0001)) {
    if (iterationCount >= 100) {
      throw new Error('Failed to converge. Max iterations reached.')
    }

    if (difference.lessThan(0)) {
      lowerBound = amountReturning
    } else {
      upperBound = amountReturning
    }

    amountReturning = lowerBound.plus(upperBound).div(2)
    difference = getSellDifference({ amount, targetShareIndex, shares, amountReturning })

    iterationCount++
  }

  return amountReturning
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

function findShareIndex(shares: Array<Decimal>, targetShare: Decimal): number {
  return shares.findIndex((share) => share.eq(targetShare))
}

function sumShares(shares: Array<Decimal>) {
  return shares.reduce((sum, share) => sum.add(share), new Decimal(0))
}

function multiplyShares(shares: Array<Decimal>) {
  return shares.reduce((sum, share) => sum.times(share), new Decimal(1))
}

export function calculateProbability({ index, shares }: { index: number; shares: Array<Decimal | number> }): Decimal {
  const indexShares = shares[index]

  // Calculate the sum of the shares of each index
  const sum = shares.reduce<Decimal>((sum, share) => sum.plus(share), new Decimal(0))

  // The probability for the given index is one minus the share count at the index times the number of dimensions divided by the sum of all shares
  const probability = new Decimal(1).sub(new Decimal(indexShares).mul(shares.length - 1).div(sum))

  return probability
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
  return calculateTrade({ amount, targetShare, shares, isBuy })
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
}): Promise<{ probability: Decimal; shares: Decimal; cost: Decimal }> {
  const targetIndex = findShareIndex(shares, targetShare)
  const currentProbability = calculateProbability({ index: targetIndex, shares })
  const isBuy = currentProbability.lt(probability)

  let costToHitProbability = calculateProbabilityCost({ probability, targetShare, shares, isBuy })
  const cost = Decimal.min(costToHitProbability, amount)

  const returnedShares = calculateTrade({ amount: cost, targetShare, shares, isBuy })

  const updatedShares = shares.map((share, i) =>
    i === targetIndex ? share.sub(returnedShares).add(cost) : isBuy ? share.add(cost) : share.sub(returnedShares)
  )

  return {
    probability: calculateProbability({
      index: targetIndex,
      shares: updatedShares,
    }),
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
}): Array<Decimal> {
  // const totalShares = options.reduce((sum, option) => sum.add(option.shares), new Decimal(0))
  // const newShares: Decimal[] = []

  // for (const option of options) {
  //   const { shares, liquidityProbability } = option
  //   const currentProbability = shares.div(totalShares)

  //   const p = calculateNewP(currentProbability, liquidityProbability, amount, shares, totalShares)
  //   const newOptionShares = calculateNewShares(p, amount, shares, totalShares)

  //   newShares.push(newOptionShares)
  // }

  return [amount, amount]
}

// function calculateNewP(
//   currentProbability: Decimal,
//   liquidityProbability: Decimal,
//   amount: Decimal,
//   shares: Decimal,
//   totalShares: Decimal
// ): Decimal {
//   // This is a simplified approximation. You may need to use numerical methods for more accuracy.
//   const weight = amount.div(totalShares.add(amount))
//   return currentProbability.mul(Decimal.sub(1, weight)).add(liquidityProbability.mul(weight))
// }

// function calculateNewShares(p: Decimal, amount: Decimal, shares: Decimal, totalShares: Decimal): Decimal {
//   const n = totalShares.sub(shares)
//   const newShares = Decimal.pow(shares.add(amount), p)
//     .mul(Decimal.pow(n.add(amount), Decimal.sub(1, p)))
//     .sub(Decimal.pow(shares, p).mul(Decimal.pow(n, Decimal.sub(1, p))))

//   return newShares
// }
