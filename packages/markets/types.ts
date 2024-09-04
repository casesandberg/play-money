import { Market, MarketOption, MarketResolution, User } from '@play-money/database'

export type ExtendedMarket = Market & {
  user: User
  options: Array<MarketOption>
  marketResolution?: MarketResolution & {
    resolution: MarketOption
    resolvedBy: User
  }
}
