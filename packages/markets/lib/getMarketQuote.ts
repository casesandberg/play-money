import Decimal from 'decimal.js'
import { quote } from '@play-money/finance/amms/maniswap-v1.1'
import { REALIZED_GAINS_TAX } from '@play-money/finance/economy'
import { getMarketBalances } from '@play-money/finance/lib/getBalances'
import { getMarketAmmAccount } from './getMarketAmmAccount'

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
  const ammBalances = await getMarketBalances({ accountId: ammAccount.id, marketId })

  const targetBalance = ammBalances.find(({ assetId }) => assetId === optionId)
  const optionBalances = ammBalances.filter(({ assetType }) => assetType === 'MARKET_OPTION')
  const optionsShares = optionBalances.map(({ total }) => total)

  // TODO: Change to multi-step quote to account for limit orders
  let { probability, shares } = await quote({
    amount,
    probability: isBuy ? new Decimal(0.99) : new Decimal(0.01),
    targetShare: targetBalance!.total,
    shares: optionsShares,
  })

  if (REALIZED_GAINS_TAX) {
    shares = shares.sub(shares.times(REALIZED_GAINS_TAX))
  }

  return {
    probability,
    shares,
  }
}
