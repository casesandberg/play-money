import Decimal from 'decimal.js'
import db, { Balance, MarketOptionPosition } from '@play-money/database'
import { AssetTypeType } from '@play-money/database/zod/inputTypeSchemas/AssetTypeSchema'
import { getMarket } from '@play-money/markets/lib/getMarket'

export type NetBalance = Omit<Balance, 'subtotals'> & { subtotals: Record<string, number> }
export type NetBalanceAsNumbers = Omit<Balance, 'total' | 'subtotals'> & {
  total: number
  subtotals: Record<string, number>
}

export type MarketOptionPositionAsNumbers = Omit<MarketOptionPosition, 'value' | 'cost' | 'quantity'> & {
  value: number
  cost: number
  quantity: number
}

export async function getBalance({
  accountId,
  assetType,
  assetId,
  marketId,
}: {
  accountId: string
  assetType: AssetTypeType
  assetId: string
  marketId?: string
}): Promise<NetBalance> {
  const balance = db.balance.findFirst({
    where: {
      accountId,
      assetType,
      assetId,
      marketId: marketId ?? null,
    },
  })

  if (!balance) {
    throw new Error('No balance')
  }

  return balance as unknown as NetBalance
}

export async function getMarketBalances({
  accountId,
  marketId,
}: {
  accountId: string
  marketId: string
}): Promise<Array<NetBalance>> {
  const market = marketId ? await getMarket({ id: marketId, extended: true }) : undefined
  const balances = await Promise.all([
    ...(market?.options || []).map((option) => {
      return getBalance({ accountId, assetType: 'MARKET_OPTION', assetId: option.id, marketId })
    }),
    getBalance({ accountId, assetType: 'CURRENCY', assetId: 'PRIMARY', marketId }),
  ])

  return balances.filter((x) => x !== null)
}

export function transformMarketBalancesToNumbers(balances: Array<NetBalance> = []): Array<NetBalanceAsNumbers> {
  return balances.map((balance) => ({
    ...balance,
    total: balance.total.toNumber(),
  }))
}

export function transformMarketOptionPositionToNumbers(
  positions: Array<MarketOptionPosition> = []
): Array<MarketOptionPositionAsNumbers> {
  return positions.map((balance) => ({
    ...balance,
    value: balance.value.toNumber(),
    cost: balance.cost.toNumber(),
    quantity: balance.quantity.toNumber(),
  }))
}
