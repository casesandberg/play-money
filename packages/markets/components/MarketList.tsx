import Link from 'next/link'
import { MarketLikelyOption } from '@play-money/markets/components/MarketLikelyOption'
import { UserAvatar } from '@play-money/ui/UserAvatar'
import { UserLink } from '@play-money/users/components/UserLink'
import { ExtendedMarket } from './MarketOverviewPage'

export function MarketList({ markets }: { markets: Array<ExtendedMarket> }) {
  return (
    <div className="flex-1 space-y-4">
      {markets.map((market) => {
        return (
          <div className="border p-4" key={market.id}>
            <Link className="line-clamp-2 text-lg font-medium" href={`/questions/${market.id}/${market.slug}`}>
              {market.question}
            </Link>

            <div className="flex min-h-5 gap-4 text-sm text-muted-foreground">
              <div className="flex gap-2 overflow-hidden">
                {market.marketResolution ? (
                  <div className="font-medium" style={{ color: market.marketResolution.resolution.color }}>
                    Resolved {market.marketResolution.resolution.name}
                  </div>
                ) : (
                  <MarketLikelyOption market={market} />
                )}
              </div>

              <div className="ml-auto flex flex-shrink-0 items-center gap-1">
                <UserAvatar user={market.user} size="sm" />

                <UserLink hideUsername user={market.user} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
