import { Market, MarketOption, MarketResolution, User } from '@play-money/database'

export type ExtendedMarket = Omit<
  Market,
  'liquidityCount' | 'commentCount' | 'uniqueTraderCount' | 'uniquePromotersCount'
> & {
  liquidityCount?: number
  commentCount?: number
  uniqueTraderCount?: number
  uniquePromotersCount?: number

  user: User
  options: Array<Omit<MarketOption, 'probability'> & { probability?: number }>
  marketResolution?: MarketResolution & {
    resolution: MarketOption
    resolvedBy: User
  }
}
