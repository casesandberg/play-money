import { format, isPast } from 'date-fns'
import _ from 'lodash'
import React from 'react'
import { CurrencyDisplay } from '@play-money/finance/components/CurrencyDisplay'
import { TradesTable } from '@play-money/finance/components/TradesTable'
import { TransactionWithEntries } from '@play-money/finance/types'
import { UserAvatar } from '@play-money/ui/UserAvatar'
import { Card, CardContent, CardHeader, CardTitle } from '@play-money/ui/card'
import { UserLink } from '@play-money/users/components/UserLink'
import { ExtendedMarket } from '../types'
import { MarketToolbar } from './MarketToolbar'

export function MarketTradesPage({
  market,
  transactions,
  totalPages,
}: {
  market: ExtendedMarket
  transactions: Array<TransactionWithEntries>
  totalPages: number
}) {
  const simplyIfTwoOptions = market.options.length === 2

  const mostLikelyOption = market.options.reduce((prev, current) =>
    (prev.probability || 0) > (current.probability || 0) ? prev : current
  )

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
        {transactions.length ? (
          <TradesTable data={transactions} totalPages={totalPages} />
        ) : (
          <div className="text-sm text-muted-foreground">No trades have been made yet.</div>
        )}
      </CardContent>
    </Card>
  )
}
