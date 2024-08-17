import Decimal from 'decimal.js'
import { quote } from '@play-money/finance/amms/maniswap-v1.1'
import { getBalances } from '@play-money/finance/lib/getBalances'
import { getMarketAmmAccount } from '@play-money/finance/lib/getMarketAmmAccount'

export async function getMarketQuote({
  marketId,
  optionId,
  amount,
  isBuy,
}: {
  marketId: string
  optionId: string
  amount: Decimal
  isBuy: boolean
}) {
  const ammAccount = await getMarketAmmAccount({ marketId })
  const ammBalances = await getBalances({ accountId: ammAccount.id, marketId })

  const targetBalance = ammBalances.find(({ assetId }) => assetId === optionId)
  const optionBalances = ammBalances.filter(({ assetType }) => assetType === 'MARKET_OPTION')
  const optionsShares = optionBalances.map(({ amount }) => amount)

  // TODO: Change to multi-step quote to account for limit orders
  const { probability, shares } = await quote({
    amount,
    probability: isBuy ? new Decimal(0.99) : new Decimal(0.01),
    targetShare: targetBalance!.amount,
    shares: optionsShares,
  })

  return {
    probability,
    shares,
  }
}
