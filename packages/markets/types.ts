import { Account, List, Market, MarketOption, MarketOptionPosition, MarketResolution, User } from '@play-money/database'

export type ExtendedMarket = Market & {
  user: User
  options: Array<MarketOption>
  marketResolution?: MarketResolution & {
    resolution: MarketOption
    resolvedBy: User
  }
  parentList?: List
}

export type ExtendedMarketPosition = MarketOptionPosition & {
  option: MarketOption
  market: Market
  account: Account & {
    user: User
  }
}
