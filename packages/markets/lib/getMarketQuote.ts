import Decimal from 'decimal.js'
import { getAmmAccount } from '@play-money/accounts/lib/getAmmAccount'
import { quote } from '@play-money/amms/lib/maniswap-v1'
import db from '@play-money/database'
import { isPurchasableCurrency } from './helpers'

export async function getMarketQuote({
  marketId,
  optionId,
  amount,
  isBuy,
}: {
  marketId: string
  optionId: string
  amount: number
  isBuy: boolean
}) {
  const marketOption = await db.marketOption.findFirst({
    where: { id: optionId, marketId },
  })

  if (!marketOption) {
    throw new Error('Invalid optionId')
  }

  if (!isPurchasableCurrency(marketOption.currencyCode)) {
    throw new Error('Invalid option currency code')
  }

  const ammAccount = await getAmmAccount({ marketId })

  const decimalAmount = new Decimal(amount)

  // TODO: Change to multi-step quote to account for limit orders
  const { probability, shares } = await quote({
    ammAccountId: ammAccount.id,
    currencyCode: marketOption.currencyCode,
    amount: decimalAmount,
    isBuy,
  })

  return {
    probability,
    shares,
  }
}
