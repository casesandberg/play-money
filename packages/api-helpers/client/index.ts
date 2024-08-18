import { CommentWithReactions } from '@play-money/comments/lib/getComment'
import { Market, User } from '@play-money/database'
import type { TransactionWithItems } from '@play-money/finance/lib/getTransactions'
import type { ExtendedMarket } from '@play-money/markets/components/MarketOverviewPage'

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
  })
  if (!res.ok || res.status >= 400) {
    const { error } = (await res.json()) as { error: string }
    throw new Error(error || 'There was an error with this request')
  }

  return res.json() as Promise<T>
}

export async function getMarketTransactions({ marketId }: { marketId: string }) {
  return apiHandler<{ transactions: Array<TransactionWithItems> }>(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/transactions?marketId=${marketId}&transactionType=MARKET_BUY,MARKET_SELL`
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
  entity: { type: string; id: string }
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
  return apiHandler<{ balance: number }>(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/me/balance`)
}

export async function getMarkets() {
  return apiHandler<{
    markets: Array<ExtendedMarket & { commentCount: number; liquidityCount: number; uniqueTraderCount: number }>
  }>(`${process.env.NEXT_PUBLIC_API_URL}/v1/markets`, {
    next: { tags: ['markets'] },
  })
}

export async function getExtendedMarket({ marketId }: { marketId: string }) {
  return apiHandler<ExtendedMarket>(`${process.env.NEXT_PUBLIC_API_URL}/v1/markets/${marketId}?extended=true`, {
    next: { tags: [`market:${marketId}`] },
  })
}

export async function createMarket(body: Record<string, unknown>) {
  return apiHandler<Market>(`${process.env.NEXT_PUBLIC_API_URL}/v1/markets`, {
    method: 'POST',
    body,
  })
}

export async function updateMarket({ marketId, body }: { marketId: string; body: Record<string, unknown> }) {
  return apiHandler<Market>(`${process.env.NEXT_PUBLIC_API_URL}/v1/markets/${marketId}`, {
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
  return apiHandler<{ newProbability: number; potentialReturn: number }>(
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
}): Promise<{ comments: Array<CommentWithReactions> }> {
  return apiHandler<{ comments: Array<CommentWithReactions> }>(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/markets/${marketId}/comments`,
    {
      next: { tags: ['comments'] },
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
  return apiHandler<{ users: Array<User>; markets: Array<Market> }>(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/search?query=${query}`
  )
}

export async function getUserCheckUsername({
  username,
}: {
  username: string
}): Promise<{ available: boolean; message?: string }> {
  return apiHandler<{ available: boolean; message?: string }>(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/users/check-username?username=${encodeURIComponent(username)}`
  )
}

export async function updateMe(data: Record<string, unknown>) {
  return apiHandler<User>(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/me`, {
    method: 'PATCH',
    body: data,
  })
}

export async function getUserStats({ userId }: { userId: string }) {
  return apiHandler<{
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
  }>(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/${userId}/stats`)
}

export async function getUserUsername({ username }: { username: string }): Promise<User> {
  return apiHandler<User>(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/username/${username}`, {
    next: {
      revalidate: 0, // Equivalent to `cache: 'no-store'` in Next.js for disabling caching
    },
  })
}

export async function getUserTransactions({
  userId,
}: {
  userId: string
}): Promise<{ transactions: Array<TransactionWithItems> }> {
  return apiHandler<{ transactions: Array<TransactionWithItems> }>(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/users/${userId}/transactions`
  )
}

export async function getUserMarkets({ userId }: { userId: string }): Promise<{ markets: Array<ExtendedMarket> }> {
  return apiHandler<{ markets: Array<ExtendedMarket> }>(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/markets?createdBy=${userId}`
  )
}
