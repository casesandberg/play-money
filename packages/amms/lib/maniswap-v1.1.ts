import Decimal from 'decimal.js'

function findDecimalIndex(shares: Decimal[], targetShare: Decimal): number {
  for (let i = 0; i < shares.length; i++) {
    if (shares[i].eq(targetShare)) {
      return i
    }
  }
  return -1 // Return -1 if no match is found
}

/*
 This is currently a _Uniswap_ implementation, not Maniswap, since it does not have a dynamic `p`.
 Instead, the `p` is set at 0.5, which allows us to ignore the exponent (since the actual value of k does not
 matter, as long as the constraint is obeyed)

 For more information, see https://manifoldmarkets.notion.site/Maniswap-ce406e1e897d417cbd491071ea8a0c39
*/
function calculateBuyShares({
  amount,
  targetShare,
  sharesSum,
}: {
  amount: Decimal
  targetShare: Decimal
  sharesSum: Decimal
}): Decimal {
  return amount.times(amount.add(sharesSum)).div(amount.add(sharesSum.sub(targetShare)))
}

function calculateSellShares({
  amount,
  targetShare,
  sharesSum,
}: {
  amount: Decimal
  targetShare: Decimal
  sharesSum: Decimal
}): Decimal {
  return sharesSum
    .add(amount)
    .sub(Decimal.sqrt(sharesSum.add(amount).pow(2).sub(sharesSum.sub(targetShare).times(4).times(amount))))
    .times(0.5)
}

function calculateBuyProbabilityCost({
  probability,
  targetShare,
  sharesSum,
}: {
  probability: Decimal
  targetShare: Decimal
  sharesSum: Decimal
}): Decimal {
  const totalOppositeShares = sharesSum.sub(targetShare)

  return Decimal.sqrt(totalOppositeShares.times(targetShare).times(probability).neg().div(probability.sub(1))).sub(
    totalOppositeShares
  )
}

function calculateSellProbabilityCost({
  probability,
  targetShare,
  sharesSum,
}: {
  probability: Decimal
  targetShare: Decimal
  sharesSum: Decimal
}): Decimal {
  const totalOppositeShares = sharesSum.sub(targetShare)

  return Decimal.sqrt(totalOppositeShares.times(targetShare).times(probability.sub(1)).neg().div(probability)).sub(
    targetShare
  )
}

function calculateProbability({ targetShare, shares }: { targetShare: Decimal; shares: Array<Decimal> }): Decimal {
  const totalShares = shares.reduce((sum, share) => sum.add(share), new Decimal(0))
  return totalShares.sub(targetShare).div(totalShares)
}

export function buy({
  amount,
  targetShare,
  shares,
}: {
  amount: Decimal
  targetShare: Decimal
  shares: Array<Decimal>
}): Decimal {
  const sharesSum = shares.reduce((sum, share) => sum.add(share), new Decimal(0))
  return calculateBuyShares({ amount, targetShare, sharesSum })
}

export function sell({
  amount,
  targetShare,
  shares,
}: {
  amount: Decimal
  targetShare: Decimal
  shares: Array<Decimal>
}): Decimal {
  const sharesSum = shares.reduce((sum, share) => sum.add(share), new Decimal(0))
  return calculateSellShares({ amount, targetShare, sharesSum })
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
  const targetIndex = findDecimalIndex(shares, targetShare)
  const sharesSum = shares.reduce((sum, share) => sum.add(share), new Decimal(0))

  const currentProbability = calculateProbability({
    targetShare,
    shares,
  })

  const isBuy = currentProbability.lt(probability)

  let costToHitProbability = isBuy
    ? calculateBuyProbabilityCost({ probability, targetShare, sharesSum })
    : calculateSellProbabilityCost({ probability, targetShare, sharesSum })

  const cost = costToHitProbability.gt(amount) ? amount : costToHitProbability

  const returnedShares = isBuy
    ? calculateBuyShares({ amount: cost, targetShare, sharesSum })
    : calculateSellShares({ amount: cost, targetShare, sharesSum })

  const updatedShares = shares.map((share, i) =>
    i === targetIndex ? share.sub(returnedShares).add(cost) : isBuy ? share.add(cost) : share.sub(returnedShares)
  )

  return {
    probability: calculateProbability({
      targetShare: updatedShares[targetIndex],
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
  // TODO: Fix this to account property for liquidityProbability
  return options.map((option) => option.shares.plus(amount.times(option.liquidityProbability).times(2)))
}
