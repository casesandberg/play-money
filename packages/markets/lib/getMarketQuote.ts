import Decimal from 'decimal.js'
import { getAmmAccount } from '@play-money/accounts/lib/getAmmAccount'
import { quote } from '@play-money/amms/lib/maniswap-v1'

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
  const ammAccount = await getAmmAccount({ marketId })

  // TODO: Change to multi-step quote to account for limit orders
  const { probability, shares } = await quote({
    ammAccountId: ammAccount.id,
    amount,
    isBuy,
    assetType: 'MARKET_OPTION',
    assetId: optionId,
  })

  return {
    probability,
    shares,
  }
}
