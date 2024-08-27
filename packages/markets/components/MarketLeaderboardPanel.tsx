import React from 'react'
import { useMarketPositions } from '@play-money/api-helpers/client/hooks'
import { CurrencyDisplay } from '@play-money/finance/components/CurrencyDisplay'
import { Badge } from '@play-money/ui/badge'
import { Card, CardContent } from '@play-money/ui/card'
import { cn } from '@play-money/ui/utils'
import { UserLink } from '@play-money/users/components/UserLink'
import { ExtendedMarket } from '../types'

export function MarketLeaderboardPanel({ market }: { market: ExtendedMarket }) {
  const { data: positions } = useMarketPositions({ marketId: market.id })
  const userInLeaderboard = positions?.user && positions?.balances.find((b) => b.accountId === positions.user.accountId)

  return positions?.balances.length || positions?.user ? (
    <Card>
      <CardContent className="p-3 md:py-4">
        {positions?.balances.length ? (
          <div>
            <div className="text-xs font-semibold uppercase text-muted-foreground">Top Winners</div>
            <ul className="divide-y divide-muted">
              {positions?.balances.map((balance, i) => {
                return (
                  <li className="flex items-center gap-2 py-2" key={balance.id}>
                    <Badge
                      variant={i > 2 ? 'outline' : 'black'}
                      className={cn(
                        'size-5 justify-center p-0',
                        i === 0 ? 'bg-[#FFD700]' : i === 1 ? 'bg-[#C0C0C0]' : i === 2 ? 'bg-[#CD7F32]' : ''
                      )}
                    >
                      {i + 1}
                    </Badge>
                    <UserLink user={balance.account.userPrimary} className="truncate text-sm" hideUsername />
                    <span className="ml-auto font-mono text-sm text-muted-foreground">
                      <CurrencyDisplay value={balance.total} isShort />
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}

        {positions?.user && !userInLeaderboard ? (
          <div>
            <div className="mt-2 text-xs font-semibold uppercase text-muted-foreground">You</div>
            <li className="flex items-center gap-2 py-2">
              <UserLink user={positions.user.account.userPrimary} className="truncate text-sm" hideUsername />
              <span className="ml-auto font-mono text-sm text-muted-foreground">
                <CurrencyDisplay value={positions.user.total} isShort />
              </span>
            </li>
          </div>
        ) : null}
      </CardContent>
    </Card>
  ) : null
}
