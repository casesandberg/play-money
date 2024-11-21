import { format, isPast } from 'date-fns'
import _ from 'lodash'
import React from 'react'
import { CurrencyDisplay } from '@play-money/finance/components/CurrencyDisplay'
import { formatNumber } from '@play-money/finance/lib/formatCurrency'
import { UserAvatar } from '@play-money/ui/UserAvatar'
import { Card, CardContent, CardHeader, CardTitle } from '@play-money/ui/card'
import { UserLink } from '@play-money/users/components/UserLink'
import { ExtendedMarket, ExtendedMarketPosition } from '../types'
import { MarketToolbar } from './MarketToolbar'

export function MarketPositionsPage({
  market,
  positions,
}: {
  market: ExtendedMarket
  positions: Array<ExtendedMarketPosition>
}) {
  const simplyIfTwoOptions = market.options.length === 2

  const mostLikelyOption = market.options.reduce((prev, current) =>
    (prev.probability || 0) > (current.probability || 0) ? prev : current
  )

  const orderedOptions = _.orderBy(market.options, 'createdAt')

  return (
    <Card className="flex-1">
      <MarketToolbar market={market} />

      <CardHeader className="pt-0 md:pt-0">
        <CardTitle className="leading-relaxed">{market.question}</CardTitle>
        <div className="flex flex-row flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground md:flex-nowrap">
          {!market.marketResolution ? (
            <div style={{ color: mostLikelyOption.color }} className="flex-shrink-0 font-medium">
              {Math.round(mostLikelyOption.probability || 0)}% {_.truncate(mostLikelyOption.name, { length: 30 })}
            </div>
          ) : null}
          {market.liquidityCount ? (
            <div className="flex-shrink-0">
              <CurrencyDisplay value={market.liquidityCount} isShort /> Vol.
            </div>
          ) : null}
          {market.closeDate ? (
            <div className="flex-shrink-0">
              {isPast(market.closeDate) ? 'Ended' : 'Ending'} {format(market.closeDate, 'MMM d, yyyy')}
            </div>
          ) : null}
          {market.user ? (
            <div className="flex items-center gap-1 truncate">
              <UserAvatar user={market.user} size="sm" />
              <UserLink user={market.user} hideUsername />
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 border-t pt-3 md:pt-6">
        {positions.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {orderedOptions.map((option) => {
              const optionPositions = _.filter(positions, { optionId: option.id })

              return (
                <Card key={option.id} className="divide-y">
                  <div className="px-4 py-2 text-sm font-medium uppercase text-muted-foreground">{option.name}</div>
                  {_.orderBy(optionPositions, (position) => Number(position.quantity), 'desc').map((position) => (
                    <div key={position.id} className="flex flex-row flex-wrap justify-between gap-x-4 px-4 py-1">
                      {position.account.user ? (
                        <div className="flex flex-row items-center gap-2">
                          <UserAvatar user={position.account.user} size="sm" />
                          <UserLink user={position.account.user} />
                        </div>
                      ) : (
                        position.account.id
                      )}
                      <div className="ml-auto">{formatNumber(Number(position.quantity))}</div>
                    </div>
                  ))}
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No positions yet.</div>
        )}
      </CardContent>
    </Card>
  )
}
