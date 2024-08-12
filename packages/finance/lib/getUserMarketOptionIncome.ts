import { Decimal } from 'decimal.js'
import { getAssetBalances, getAssetCost } from '@play-money/finance/lib/getBalances'
import { getMarketQuote } from '@play-money/markets/lib/getMarketQuote'

// Other Comprehensive Income (OCI) is recorded as Equity. It does not count towards income or net income. Unrealized Gains and Losses from Market Options.
export async function getUserMarketOptionIncome({
  accountId,
  marketId,
  optionId,
}: {
  accountId: string
  marketId: string
  optionId: string
}) {
  const assetBalance = await getAssetBalances({
    accountId,
    marketId,
    assetType: 'MARKET_OPTION',
    assetId: optionId,
  })

  let value = new Decimal(0)
  let cost = new Decimal(0)
  let unrealizedGainLoss = new Decimal(0)

  if (!assetBalance.amount.equals(0)) {
    const quoteResult = await getMarketQuote({
      marketId,
      optionId,
      amount: assetBalance.amount,
      isBuy: false,
    })
    value = new Decimal(quoteResult.shares)

    cost = await getAssetCost({
      accountId,
      marketId,
      optionId,
    })

    unrealizedGainLoss = value.minus(cost.abs())
  }

  return {
    balance: assetBalance.amount,
    cost: cost.abs().toNumber(),
    value: value.toNumber(),
    unrealizedGainLoss: unrealizedGainLoss.toNumber(),
  }
}
