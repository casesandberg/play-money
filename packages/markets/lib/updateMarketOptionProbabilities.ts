import { TransactionClient } from '@play-money/database'
import { NetBalance } from '@play-money/finance/lib/getBalances'
import { marketOptionBalancesToProbabilities } from '@play-money/finance/lib/helpers'

export async function updateMarketOptionProbabilities({
  tx,
  balances,
}: {
  tx: TransactionClient
  balances: Array<NetBalance>
}) {
  const probabilities = marketOptionBalancesToProbabilities(balances)

  await Promise.all(
    Object.entries(probabilities).map(([optionId, probability]) => {
      return tx.marketOption.update({
        where: {
          id: optionId,
        },
        data: {
          probability,
        },
      })
    })
  )
}
