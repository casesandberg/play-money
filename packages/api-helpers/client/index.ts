import _ from 'lodash'
import { CommentWithReactions } from '@play-money/comments/lib/getComment'
import { ApiKey, CommentEntityType, List, Market, MarketOption, MarketOptionPosition, User } from '@play-money/database'
import { NetBalanceAsNumbers } from '@play-money/finance/lib/getBalances'
import { TransactionWithEntries, LeaderboardUser, ExtendedMarketOptionPosition } from '@play-money/finance/types'
import { ExtendedList } from '@play-money/lists/types'
import { ExtendedMarket, ExtendedMarketPosition, MarketActivity } from '@play-money/markets/types'
import { PaginatedResponse, PaginationRequest } from '../types'

// TODO: @casesandberg Generate this from OpenAPI schema

async function apiHandler<T>(
  input: string,
  options?: { method?: string; body?: Record<string, unknown>; next?: unknown }
) {
  const creds: Record<string, unknown> = {}

  try {
    // In server component
    const { cookies } = require('next/headers')
    creds.headers = { Cookie: cookies().toString() }
  } catch (error) {
    // In client component
    creds.credentials = 'include'
  }
  const res = await fetch(input, {
    method: options?.method,
    body: options?.body ? JSON.stringify(options.body) : undefined,
    next: options?.next,
    ...creds,
  } as RequestInit)

  if (!res.ok || res.status >= 400) {
    const { error } = (await res.json()) as { error: string }
    throw new Error(error || 'There was an error with this request')
  }

  if (res.status === 204) {
    throw new Error('deleted')
  }

  return res.json() as Promise<T>
}

export async function getMarketTransactions({
  marketId,
  ...paginationParams
}: {
  marketId: string
} & PaginationRequest) {
  const currentParams = new URLSearchParams(
    JSON.parse(
      JSON.stringify({
        marketId,
        transactionType: ['TRADE_BUY', 'TRADE_SELL'],
        ...paginationParams,
      })
    )
  )

  const search = currentParams.toString()

  return apiHandler<PaginatedResponse<TransactionWithEntries>>(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/transactions${search ? `?${search}` : ''}`
  )
}

export async function getMarketLiquidityTransactions({
  marketId,
  ...paginationParams
}: {
  marketId: string
} & PaginationRequest) {
  const currentParams = new URLSearchParams(
    JSON.parse(
      JSON.stringify({
        marketId,
        transactionType: ['LIQUIDITY_INITIALIZE', 'LIQUIDITY_DEPOSIT', 'LIQUIDITY_WITHDRAWAL'],
        ...paginationParams,
      })
    )
  )

  const search = currentParams.toString()

  return apiHandler<PaginatedResponse<TransactionWithEntries>>(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/transactions${search ? `?${search}` : ''}`
  )
}

export async function createCommentReaction({ commentId, emoji }: { commentId: string; emoji: string }) {
  return apiHandler<unknown>(`${process.env.NEXT_PUBLIC_API_URL}/v1/comments/${commentId}/reaction`, {
    method: 'POST',
    body: {
      emoji,
      commentId,
    },
  })
}

export async function createComment({
  content,
  parentId,
  entity,
}: {
  content: string
  parentId?: string
  entity: { type: CommentEntityType; id: string }
}) {
  return apiHandler<unknown>(`${process.env.NEXT_PUBLIC_API_URL}/v1/comments`, {
    method: 'POST',
    body: {
      content,
      parentId: parentId ?? null,
      entityType: entity.type,
      entityId: entity.id,
    },
  })
}

export async function updateComment({ commentId, content }: { commentId: string; content: string }) {
  return apiHandler<unknown>(`${process.env.NEXT_PUBLIC_API_URL}/v1/comments/${commentId}`, {
    method: 'PATCH',
    body: {
      content,
    },
  })
}

export async function deleteComment({ commentId }: { commentId: string }) {
  return apiHandler<unknown>(`${process.env.NEXT_PUBLIC_API_URL}/v1/comments/${commentId}`, {
    method: 'DELETE',
  })
}

export async function getMyBalance() {
  return apiHandler<{ data: { balance: number } }>(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/me/balance`)
}

export async function getMyReferrals() {
  return apiHandler<{ data: Array<User> }>(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/me/referrals`)
}

export async function getMarkets({
  status,
  createdBy,
  tags,
  ...paginationParams
}: {
  status?: string
  createdBy?: string
  tags?: Array<string>
} & PaginationRequest = {}) {
  const currentParams = new URLSearchParams(
    JSON.parse(JSON.stringify({ status, createdBy, tags, ...paginationParams }))
  )

  const search = currentParams.toString()

  return apiHandler<PaginatedResponse<ExtendedMarket>>(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/markets${search ? `?${search}` : ''}`,
    {
      next: { tags: ['markets'] },
    }
  )
}

export async function getMarketPositions({
  ownerId,
  marketId,
  status,
  ...paginationParams
}: {
  ownerId?: string
  marketId?: string
  status?: 'active' | 'closed' | 'all'
} & PaginationRequest = {}): Promise<PaginatedResponse<ExtendedMarketPosition>> {
  const currentParams = new URLSearchParams(
    JSON.parse(
      JSON.stringify({
        ownerId,
        status,
        ...paginationParams,
      })
    )
  )
  const search = currentParams.toString()

  return apiHandler<PaginatedResponse<ExtendedMarketPosition>>(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/markets/${marketId}/positions${search ? `?${search}` : ''}`,
    {
      next: { tags: ['markets'] },
    }
  )
}

export async function getLists({
  ownerId,
  ...paginationParams
}: {
  ownerId?: string
} & PaginationRequest = {}): Promise<PaginatedResponse<ExtendedList>> {
  const currentParams = new URLSearchParams(JSON.parse(JSON.stringify({ ownerId, ...paginationParams })))
  const search = currentParams.toString()

  return apiHandler<PaginatedResponse<ExtendedList>>(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/lists${search ? `?${search}` : ''}`,
    {
      next: { tags: ['lists'] },
    }
  )
}

export async function getExtendedMarket({ marketId }: { marketId: string }) {
  return apiHandler<{ data: ExtendedMarket }>(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/markets/${marketId}?extended=true`,
    {
      next: { tags: [`market:${marketId}`] },
    }
  )
}

export async function getExtendedList({ listId }: { listId: string }) {
  return apiHandler<{ data: ExtendedList }>(`${process.env.NEXT_PUBLIC_API_URL}/v1/lists/${listId}?extended=true`, {
    next: { tags: [`list:${listId}`] },
  })
}

export async function createMarket(body: Record<string, unknown>) {
  return apiHandler<{ data: { market?: Market; list?: List } }>(`${process.env.NEXT_PUBLIC_API_URL}/v1/markets`, {
    method: 'POST',
    body,
  })
}

export async function createListMarket({ listId }: { listId: string }, body: Record<string, unknown>) {
  return apiHandler<{ data: { market?: Market; list?: List } }>(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/lists/${listId}/markets`,
    {
      method: 'POST',
      body,
    }
  )
}

export async function updateMarket({ marketId, body }: { marketId: string; body: Record<string, unknown> }) {
  return apiHandler<{ data: Market }>(`${process.env.NEXT_PUBLIC_API_URL}/v1/markets/${marketId}`, {
    method: 'PATCH',
    body: body,
  })
}

export async function updateList({ listId, body }: { listId: string; body: Record<string, unknown> }) {
  return apiHandler<{ data: Market }>(`${process.env.NEXT_PUBLIC_API_URL}/v1/lists/${listId}`, {
    method: 'PATCH',
    body: body,
  })
}

export async function updateMarketOption({
  marketId,
  optionId,
  body,
}: {
  marketId: string
  optionId: string
  body: Record<string, unknown>
}) {
  return apiHandler<{ data: Market }>(`${process.env.NEXT_PUBLIC_API_URL}/v1/markets/${marketId}/options/${optionId}`, {
    method: 'PATCH',
    body: body,
  })
}

export async function createLiquidity({ marketId, amount }: { marketId: string; amount: number }) {
  return apiHandler<unknown>(`${process.env.NEXT_PUBLIC_API_URL}/v1/markets/${marketId}/liquidity`, {
    method: 'POST',
    body: {
      amount,
    },
  })
}

export async function createMarketBuy({
  marketId,
  optionId,
  amount,
}: {
  marketId: string
  optionId: string
  amount: number
}) {
  return apiHandler<unknown>(`${process.env.NEXT_PUBLIC_API_URL}/v1/markets/${marketId}/buy`, {
    method: 'POST',
    body: {
      optionId,
      amount,
    },
  })
}

export async function createMarketSell({
  marketId,
  optionId,
  amount,
}: {
  marketId: string
  optionId: string
  amount: number
}) {
  return apiHandler<unknown>(`${process.env.NEXT_PUBLIC_API_URL}/v1/markets/${marketId}/sell`, {
    method: 'POST',
    body: {
      optionId,
      amount,
    },
  })
}

export async function getMarketQuote({
  marketId,
  optionId,
  amount,
  isBuy = true,
}: {
  marketId: string
  optionId: string
  amount: number
  isBuy?: boolean
}) {
  return apiHandler<{ data: { newProbability: number; potentialReturn: number } }>(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/markets/${marketId}/quote`,
    {
      method: 'POST',
      body: {
        optionId,
        amount,
        isBuy,
      },
    }
  )
}

export async function getMarketComments({
  marketId,
}: {
  marketId: string
}): Promise<{ data: Array<CommentWithReactions> }> {
  return apiHandler<{ data: Array<CommentWithReactions> }>(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/markets/${marketId}/comments`,
    {
      next: { tags: [`${marketId}:comments`] },
    }
  )
}

export async function getMarketActivity({ marketId }: { marketId: string }): Promise<{ data: Array<MarketActivity> }> {
  return apiHandler<{ data: Array<MarketActivity> }>(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/markets/${marketId}/activity`,
    {
      next: { tags: [`${marketId}:activity`] },
    }
  )
}

export async function getListComments({ listId }: { listId: string }): Promise<{ data: Array<CommentWithReactions> }> {
  return apiHandler<{ data: Array<CommentWithReactions> }>(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/lists/${listId}/comments`,
    {
      next: { tags: [`list:${listId}:comments`] },
    }
  )
}

export async function createMarketResolve({
  marketId,
  optionId,
  supportingLink,
}: {
  marketId: string
  optionId: string
  supportingLink?: string
}) {
  return apiHandler<unknown>(`${process.env.NEXT_PUBLIC_API_URL}/v1/markets/${marketId}/resolve`, {
    method: 'POST',
    body: {
      optionId,
      supportingLink,
    },
  })
}

export async function createMarketCancel({ marketId, reason }: { marketId: string; reason: string }) {
  return apiHandler<unknown>(`${process.env.NEXT_PUBLIC_API_URL}/v1/markets/${marketId}/cancel`, {
    method: 'POST',
    body: {
      reason,
    },
  })
}

export async function createMyNotifications() {
  return apiHandler<unknown>(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/me/notifications`, {
    method: 'POST',
  })
}

export async function createMyResourceViewed({
  resourceType,
  resourceId,
}: {
  resourceType: string
  resourceId: string
}) {
  return apiHandler<unknown>(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/me/resource-viewed`, {
    method: 'POST',
    body: {
      resourceType,
      resourceId,
      timestamp: new Date().toISOString(),
    },
  })
}

export async function getSearch({ query }: { query: string }) {
  return apiHandler<{ data: { users: Array<User>; markets: Array<Market>; lists: Array<List> } }>(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/search?query=${query}`
  )
}

export async function getUserCheckUsername({
  username,
}: {
  username: string
}): Promise<{ data: { available: boolean; message?: string } }> {
  return apiHandler<{ data: { available: boolean; message?: string } }>(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/users/check-username?username=${encodeURIComponent(username)}`
  )
}

export async function updateMe(data: Record<string, unknown>) {
  return apiHandler<{ data: User }>(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/me`, {
    method: 'PATCH',
    body: data,
  })
}

export async function getUserStats({ userId }: { userId: string }) {
  return apiHandler<{
    data: {
      netWorth: number
      tradingVolume: number
      totalMarkets: number
      lastTradeAt: Date
      activeDayCount: number
      otherIncome: number
      quests: Array<{
        title: string
        award: number
        completed: boolean
        href: string
      }>
    }
  }>(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/${userId}/stats`)
}

export async function getUser({ userId }: { userId: string }): Promise<{ data: User }> {
  return apiHandler<{ data: User }>(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/${userId}`)
}

export async function getUserReferral({ code }: { code: string }): Promise<{ data: User }> {
  return apiHandler<{ data: User }>(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/referral/${code}`)
}

export async function getUserUsername({ username }: { username: string }): Promise<{ data: User }> {
  return apiHandler<{ data: User }>(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/username/${username}`, {
    next: {
      revalidate: 0, // Equivalent to `cache: 'no-store'` in Next.js for disabling caching
    },
  })
}

export async function getUserTransactions({ userId }: { userId: string }) {
  return apiHandler<PaginatedResponse<TransactionWithEntries>>(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/users/${userId}/transactions`
  )
}

export async function getUserPositions({
  userId,
  status,
  ...paginationParams
}: {
  userId: string
  status?: 'active' | 'closed' | 'all'
} & PaginationRequest): Promise<PaginatedResponse<ExtendedMarketOptionPosition>> {
  const currentParams = new URLSearchParams(
    JSON.parse(
      JSON.stringify({
        status,
        ...paginationParams,
      })
    )
  )
  const search = currentParams.toString()

  return apiHandler<PaginatedResponse<ExtendedMarketOptionPosition>>(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/users/${userId}/positions${search ? `?${search}` : ''}`
  )
}

export async function getUserBalance({
  userId,
}: {
  userId: string
}): Promise<{ data: { balance: NetBalanceAsNumbers } }> {
  return apiHandler<{ data: { balance: NetBalanceAsNumbers } }>(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/users/${userId}/balance`
  )
}

export async function getUserMarkets({ userId }: { userId: string }): Promise<PaginatedResponse<ExtendedMarket>> {
  return apiHandler<PaginatedResponse<ExtendedMarket>>(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/markets?createdBy=${userId}`
  )
}

export async function createMarketGenerateTags({ question }: { question: string }) {
  return apiHandler<{ data: Array<string> }>(`${process.env.NEXT_PUBLIC_API_URL}/v1/markets/generate-tags`, {
    method: 'POST',
    body: {
      question,
    },
  })
}

export async function getLeaderboard({ month, year }: { month?: string; year?: string }) {
  return apiHandler<{
    data: {
      topTraders: Array<LeaderboardUser>
      topCreators: Array<LeaderboardUser>
      topPromoters: Array<LeaderboardUser>
      topQuesters: Array<LeaderboardUser>
      topReferrers: Array<LeaderboardUser>
      userRankings?: {
        trader: LeaderboardUser
        creator: LeaderboardUser
        promoter: LeaderboardUser
        quester: LeaderboardUser
        referrer: LeaderboardUser
      }
    }
  }>(`${process.env.NEXT_PUBLIC_API_URL}/v1/leaderboard${month && year ? `?year=${year}&month=${month}` : ''}`)
}

export async function createMyApiKey({ name }: { name: string }): Promise<{ data: ApiKey }> {
  return apiHandler<{ data: ApiKey }>(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/me/api-keys`, {
    method: 'POST',
    body: {
      name,
    },
  })
}

export async function getMyApiKeys(): Promise<{ data: Array<ApiKey> }> {
  return apiHandler<{ data: Array<ApiKey> }>(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/me/api-keys`)
}
