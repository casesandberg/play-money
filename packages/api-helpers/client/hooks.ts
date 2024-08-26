import useSWR from 'swr'
import { MarketOptionPositionAsNumbers, NetBalanceAsNumbers } from '@play-money/finance/lib/getBalances'
import { TransactionWithEntries } from '@play-money/finance/types'
import { NotificationGroupWithLastNotification } from '@play-money/notifications/lib/getNotifications'
import { Quest } from '@play-money/quests/components/QuestCard'

// TODO: @casesandberg Generate this from OpenAPI schema

const SIXTY_SECONDS = 1000 * 60
const FIVE_MINUTES = SIXTY_SECONDS * 5

export function useLiquidity() {
  return useSWR<{ transactions: Array<TransactionWithEntries> }>(`/v1/liquidity`, {
    refreshInterval: FIVE_MINUTES,
  })
}

export function useRecentTrades() {
  return useSWR<{ transactions: Array<TransactionWithEntries> }>(
    `/v1/transactions?transactionType=TRADE_BUY,TRADE_SELL`,
    { refreshInterval: FIVE_MINUTES }
  )
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
      startAt: Date
      endAt: Date
    }>
  }>(`/v1/users/${userId}/graph`, { refreshInterval: FIVE_MINUTES })
}
