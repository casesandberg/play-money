import useSWR from 'swr'
import { User } from '@play-money/database'
import { MarketOptionPositionAsNumbers, NetBalanceAsNumbers } from '@play-money/finance/lib/getBalances'
import { TransactionWithEntries } from '@play-money/finance/types'
import { ExtendedMarket, MarketActivity } from '@play-money/markets/types'
import { NotificationGroupWithLastNotification } from '@play-money/notifications/lib/getNotifications'
import { Quest } from '@play-money/quests/components/QuestCard'

// TODO: @casesandberg Generate this from OpenAPI schema

const SIXTY_SECONDS = 1000 * 60
const FIVE_MINUTES = SIXTY_SECONDS * 5
const ONE_HOUR = SIXTY_SECONDS * 60

export function useRecentTrades() {
  return useSWR<{ transactions: Array<TransactionWithEntries> }>(
    `/v1/transactions?transactionType=TRADE_BUY,TRADE_SELL`,
    { refreshInterval: FIVE_MINUTES }
  )
}

export function useSiteActivity() {
  return useSWR<{ data: Array<MarketActivity> }>(`/v1/activity`, { refreshInterval: FIVE_MINUTES })
}

export function MARKET_BALANCE_PATH(marketId: string) {
  return `/v1/markets/${marketId}/balance`
}
export function useMarketBalance({ marketId }: { marketId: string }) {
  return useSWR<{
    amm: Array<NetBalanceAsNumbers>
    user: Array<NetBalanceAsNumbers>
    userPositions: Array<MarketOptionPositionAsNumbers>
  }>(MARKET_BALANCE_PATH(marketId), {
    refreshInterval: SIXTY_SECONDS,
  })
}

export function LIST_BALANCE_PATH(listId: string) {
  return `/v1/lists/${listId}/balance`
}
export function useListBalance({ listId }: { listId: string }) {
  return useSWR<{
    data: {
      user: Array<NetBalanceAsNumbers>
      userPositions: Array<MarketOptionPositionAsNumbers>
    }
  }>(LIST_BALANCE_PATH(listId), {
    refreshInterval: SIXTY_SECONDS,
  })
}

export function useMarketBalances({ marketId }: { marketId: string }) {
  return useSWR<{
    data: {
      balances: Array<NetBalanceAsNumbers & { account: { userPrimary: User } }>
      user: NetBalanceAsNumbers & { account: { userPrimary: User } }
    }
  }>(`/v1/markets/${marketId}/balances`)
}

export function MARKET_GRAPH_PATH(marketId: string) {
  return `/v1/markets/${marketId}/graph`
}
export function useMarketGraph({ marketId }: { marketId: string }) {
  return useSWR<{
    data: Array<{
      startAt: Date
      endAt: Date
      options: Array<{
        id: string
        probability: number
      }>
    }>
  }>(MARKET_GRAPH_PATH(marketId), { refreshInterval: FIVE_MINUTES })
}

export function useMarketRelated({ marketId }: { marketId: string }) {
  return useSWR<{
    markets: Array<ExtendedMarket>
  }>(`/v1/markets/${marketId}/related`)
}

export const MY_NOTIFICATIONS_PATH = '/v1/users/me/notifications'
export function useNotifications({ skip = false }: { skip?: boolean }) {
  return useSWR<{ unreadCount: number; notifications: Array<NotificationGroupWithLastNotification> }>(
    !skip ? MY_NOTIFICATIONS_PATH : null,
    { refreshInterval: FIVE_MINUTES }
  )
}

export function useUserStats({ userId, skip = false }: { userId: string; skip?: boolean }) {
  return useSWR<{ quests: Array<Quest> }>(!skip ? `/v1/users/${userId}/stats` : null)
}

export const MY_BALANCE_PATH = '/v1/users/me/balance'
export function useMyBalance({ skip = false }: { skip?: boolean }) {
  return useSWR<{ balance: number }>(!skip ? '/v1/users/me/balance' : null)
}

export function useUserGraph({ userId }: { userId: string }) {
  return useSWR<{
    data: Array<{
      balance: number
      liquidity: number
      markets: number
      startAt: Date
      endAt: Date
    }>
  }>(`/v1/users/${userId}/graph`, { refreshInterval: FIVE_MINUTES })
}

export function useTransparencyStatsUsers() {
  return useSWR<{
    data: Array<{
      dau: number
      signups: number
      referrals: number
      startAt: Date
      endAt: Date
    }>
  }>(`/v1/transparency/stats/users`, { refreshInterval: ONE_HOUR })
}
