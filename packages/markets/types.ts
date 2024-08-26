import { Market, MarketOption, MarketResolution, User } from '@play-money/database'

export type ExtendedMarketOption = MarketOption & { probability: number }
export type ExtendedMarket = Market & {
  user: User
  options: Array<ExtendedMarketOption>
  marketResolution?: MarketResolution & {
    resolution: ExtendedMarketOption
    resolvedBy: User
  }
}
