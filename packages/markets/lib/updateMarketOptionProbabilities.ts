import { TransactionClient } from '@play-money/database'
import { NetBalance } from '@play-money/finance/lib/getBalances'
import { marketOptionBalancesToProbabilities } from '@play-money/finance/lib/helpers'
import { getMarket } from './getMarket'

export async function updateMarketOptionProbabilities({
  tx,
  balances,
  marketId,
}: {
  tx: TransactionClient
  balances: Array<NetBalance>
  marketId: string
}) {
  const market = await getMarket({ id: marketId })
  const ammBalances = balances.filter((balance) => balance.accountId === market.ammAccountId)
  const probabilities = marketOptionBalancesToProbabilities(ammBalances)

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
