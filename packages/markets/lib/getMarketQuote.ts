import Decimal from 'decimal.js'
import { findShareIndex, quote } from '@play-money/finance/amms/maniswap-v1.1'
import { getMarketBalances } from '@play-money/finance/lib/getBalances'
import { calculateRealizedGainsTax, distributeRemainder } from '@play-money/finance/lib/helpers'
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

  if (!targetBalance) {
    throw new Error('Target balance not found')
  }

  // TODO: Change to multi-step quote to account for limit orders
  let { newProbabilities, shares } = await quote({
    amount,
    probability: isBuy ? new Decimal(0.99) : new Decimal(0.01),
    targetShare: targetBalance.total,
    shares: optionsShares,
  })

  const shareIndex = findShareIndex(optionsShares, targetBalance.total)
  const distributed = distributeRemainder(newProbabilities)
  const tax = calculateRealizedGainsTax({ cost: amount, salePrice: shares })

  return {
    probability: distributed[shareIndex],
    shares: shares.sub(tax),
  }
}
