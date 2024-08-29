import db, { Market } from '@play-money/database'
import { getBalance, getMarketBalances } from '@play-money/finance/lib/getBalances'
import { marketOptionBalancesToProbabilities } from '@play-money/finance/lib/helpers'
import { ExtendedMarket } from '../types'

export function getMarket(params: { id: string; extended: true }): Promise<ExtendedMarket>
export function getMarket(params: { id: string; extended?: false }): Promise<Market>
export function getMarket(params: { id: string; extended?: boolean }): Promise<Market | ExtendedMarket>

export async function getMarket({
  id,
  extended,
}: {
  id: string
  extended?: boolean
}): Promise<Market | ExtendedMarket> {
  if (extended) {
    const market = await db.market.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
        options: true,
        marketResolution: {
          include: {
            resolution: true,
            resolvedBy: true,
          },
        },
      },
    })

    if (!market) {
      throw new Error('Market not found')
    }

    const balances = await Promise.all(
      market.options.map((option) => {
        return getBalance({
          accountId: market.ammAccountId,
          assetType: 'MARKET_OPTION',
          assetId: option.id,
          marketId: id,
        })
      })
    )

    const probabilities = marketOptionBalancesToProbabilities(balances)

    market.options = market.options.map((option) => {
      return {
        ...option,
        probability: probabilities[option.id],
      }
    })

    return market
  }

  const market = await db.market.findUnique({ where: { id } })

  if (!market) {
    throw new Error('Market not found')
  }

  return market
}
