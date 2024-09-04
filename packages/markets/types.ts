import { Market, MarketOption, MarketResolution, User } from '@play-money/database'

export type ExtendedMarket = Omit<
  Market,
  'liquidityCount' | 'commentCount' | 'uniqueTradersCount' | 'uniquePromotersCount'
> & {
  liquidityCount?: number
  commentCount?: number
  uniqueTradersCount?: number
  uniquePromotersCount?: number

  user: User
  options: Array<Omit<MarketOption, 'probability'> & { probability?: number }>
  marketResolution?: MarketResolution & {
    resolution: MarketOption
    resolvedBy: User
  }
}
