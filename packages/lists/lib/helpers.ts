export function calculateTotalCost(numItems: number): number {
  const basePrice = 1000
  const decayRate = 10
  const minimumCost = 100

  let totalCost = 0

  for (let i = 1; i <= numItems; i++) {
    // Calculate the cost per item based on logarithmic decay
    const costPerItem = Math.max(basePrice / Math.log(i + decayRate), minimumCost)
    totalCost += costPerItem
  }

  totalCost = Math.round(totalCost / 100) * 100

  return totalCost
}
