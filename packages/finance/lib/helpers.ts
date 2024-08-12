import { NetBalanceAsNumbers } from './getBalances'

export function marketOptionBalancesToProbabilities(balances: Array<NetBalanceAsNumbers> = []) {
  const assetBalances = balances.filter(({ assetType }) => assetType === 'MARKET_OPTION')
  const sum = assetBalances.reduce((sum, balance) => sum + (balance.amount || 0), 0)

  return assetBalances.reduce(
    (result, assetBalance) => {
      result[assetBalance.assetId] = Math.round(((sum - assetBalance.amount) / sum) * 100)
      return result
    },
    {} as Record<string, number>
  )
}
