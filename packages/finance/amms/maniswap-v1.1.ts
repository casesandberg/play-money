import Decimal from 'decimal.js'

/*
 This is currently a _Uniswap_ implementation, not Maniswap, since it does not have a dynamic `p`.
 Instead, the `p` is set at 0.5, which allows us to ignore the exponent (since the actual value of k does not
 matter, as long as the constraint is obeyed)

 For more information, see https://manifoldmarkets.notion.site/Maniswap-ce406e1e897d417cbd491071ea8a0c39
*/
function calculateTrade({
  amount,
  targetShare,
  totalShares,
  isBuy,
}: {
  amount: Decimal
  targetShare: Decimal
  totalShares: Decimal
  isBuy: boolean
}) {
  if (isBuy) {
    return amount.times(amount.add(totalShares)).div(amount.add(totalShares.sub(targetShare)))
  }

  return totalShares
    .add(amount)
    .sub(Decimal.sqrt(totalShares.add(amount).pow(2).sub(totalShares.sub(targetShare).times(4).times(amount))))
    .times(0.5)
}

function calculateProbabilityCost({
  probability,
  targetShare,
  totalShares,
  isBuy,
}: {
  probability: Decimal
  targetShare: Decimal
  totalShares: Decimal
  isBuy: boolean
}): Decimal {
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

export function calculateProbability({ index, shares }: { index: number; shares: Array<Decimal | number> }): Decimal {
  // Calculate the product of all shares except for the one at the given index
  const productOfOtherShares = shares.reduce<Decimal>((acc, share, idx) => {
    return idx !== index ? acc.mul(share) : acc
  }, new Decimal(1))

  // Calculate the sum of all products for each index
  const sumOfProducts = shares.reduce<Decimal>((sum, _, currentIndex) => {
    const productExcludingCurrent = shares.reduce<Decimal>((acc, share, idx) => {
      return idx !== currentIndex ? acc.mul(share) : acc
    }, new Decimal(1))
    return sum.plus(productExcludingCurrent)
  }, new Decimal(0))

  // The probability for the given index is the product of other shares divided by the sum of all products
  const probability = productOfOtherShares.div(sumOfProducts)

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
  const totalShares = sumShares(shares)
  return calculateTrade({ amount, targetShare, totalShares, isBuy })
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
  const totalShares = sumShares(shares)
  const currentProbability = calculateProbability({ index: targetIndex, shares })
  const isBuy = currentProbability.lt(probability)

  let costToHitProbability = calculateProbabilityCost({ probability, targetShare, totalShares, isBuy })
  const cost = Decimal.min(costToHitProbability, amount)

  const returnedShares = calculateTrade({ amount: cost, targetShare, totalShares, isBuy })

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
