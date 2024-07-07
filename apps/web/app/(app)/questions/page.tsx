import Link from 'next/link'
import React from 'react'
import db from '@play-money/database'
import { MarketLikelyOption } from '@play-money/markets/components/MarketLikelyOption'
import { Avatar, AvatarFallback, AvatarImage } from '@play-money/ui/avatar'
import { UserLink } from '@play-money/users/components/UserLink'
import { sanitizeUser } from '@play-money/users/lib/sanitizeUser'

export default async function AppQuestionsPage() {
  // TODO: @casesandberg Extract to API call

  const rawMarkets = await db.market.findMany({
    orderBy: [
      {
        createdAt: 'desc',
      },
    ],
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

  const markets = rawMarkets.map((market) => {
    return {
      ...market,
      user: sanitizeUser(market.user),
      options: market.options.map((option) => ({
        ...option,
        color: option.currencyCode === 'YES' ? '#3b82f6' : '#ec4899',
      })),
      marketResolution: market.marketResolution
        ? {
            ...market.marketResolution,
            resolvedBy: sanitizeUser(market.marketResolution.resolvedBy),
            resolution: {
              ...market.marketResolution.resolution,
              color: market.marketResolution.resolution.currencyCode === 'YES' ? '#3b82f6' : '#ec4899',
            },
          }
        : undefined,
    }
  })

  return (
    <div>
      <div className="space-y-4">
        {markets.map((market) => {
          return (
            <div className="border p-4" key={market.id}>
              <Link className="block text-lg font-medium" href={`/questions/${market.id}/${market.slug}`}>
                {market.question}
              </Link>

              <div className="flex min-h-5 gap-4 text-sm text-muted-foreground">
                {market.marketResolution ? (
                  <div className="font-medium" style={{ color: market.marketResolution.resolution.color }}>
                    Resolved {market.marketResolution.resolution.name}
                  </div>
                ) : (
                  <MarketLikelyOption market={market} />
                )}

                <div className="ml-auto flex items-center gap-1">
                  <Avatar className="h-4 w-4">
                    <AvatarImage alt={`@${market.user.username}`} src={market.user.avatarUrl ?? ''} />
                    <AvatarFallback>{market.user.username.toUpperCase().slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <UserLink hideUsername user={market.user} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
