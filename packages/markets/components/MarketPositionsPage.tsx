'use client'

import { format, isPast, formatDistanceToNow } from 'date-fns'
import _ from 'lodash'
import React from 'react'
import { CurrencyDisplay } from '@play-money/finance/components/CurrencyDisplay'
import { calculateBalanceChanges, findBalanceChange } from '@play-money/finance/lib/helpers'
import { TransactionWithEntries } from '@play-money/finance/types'
import { UserAvatar } from '@play-money/ui/UserAvatar'
import { Card, CardContent, CardHeader, CardTitle } from '@play-money/ui/card'
import { UserLink } from '@play-money/users/components/UserLink'
import { ExtendedMarket } from '../types'
import { MarketToolbar } from './MarketToolbar'

export function MarketPositionsPage({
  market,
  transactions,
}: {
  market: ExtendedMarket
  transactions: Array<TransactionWithEntries>
}) {
  const simplyIfTwoOptions = market.options.length === 2

  const mostLikelyOption = market.options.reduce((prev, current) =>
    prev.probability > current.probability ? prev : current
  )

  return (
    <Card className="flex-1">
      <MarketToolbar market={market} />

      <CardHeader className="pt-0 md:pt-0">
        <CardTitle className="leading-relaxed">{market.question}</CardTitle>
        <div className="flex flex-row flex-wrap gap-x-4 gap-y-2 font-mono text-sm text-muted-foreground md:flex-nowrap">
          {!market.marketResolution ? (
            <div style={{ color: mostLikelyOption.color }} className="flex-shrink-0 font-medium">
              {mostLikelyOption.probability}% {_.truncate(mostLikelyOption.name, { length: 30 })}
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
          {/* <div>15 Traders</div>
    <div>$650 Volume</div> */}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 border-t pt-3 md:pt-6">
        <ul className="divide-y divide-muted">
          {transactions.length ? (
            transactions.map((transaction) => {
              if (!transaction.initiator) {
                return null
              }
              const balanceChanges = calculateBalanceChanges(transaction)
              const primaryChange = findBalanceChange({
                balanceChanges,
                accountId: transaction.initiator.primaryAccountId,
                assetType: 'CURRENCY',
                assetId: 'PRIMARY',
              })
              const optionName = transaction.options[0].name

              return (
                <li className="flex flex-wrap items-center gap-1 py-3" key={transaction.id}>
                  {transaction.initiator ? (
                    <div className="inline-flex items-center gap-2">
                      <UserAvatar user={transaction.initiator} size="sm" />
                      <UserLink hideUsername user={transaction.initiator} />
                    </div>
                  ) : null}
                  {transaction.type === 'TRADE_BUY' ? 'bought' : 'sold'}{' '}
                  <span className="font-semibold">
                    <CurrencyDisplay value={Math.abs(primaryChange?.change ?? 0)} isShort />{' '}
                    {_.truncate(optionName, { length: 30 })}
                  </span>{' '}
                  <span className="text-sm text-muted-foreground md:ml-auto">
                    {formatDistanceToNow(transaction.createdAt, { addSuffix: true })}
                  </span>
                </li>
              )
            })
          ) : (
            <li className="text-sm text-muted-foreground">No trades have been made yet.</li>
          )}
        </ul>

        {/* {market.options.map((option, i) => (
          <div>
            <div style={{ color: option.color }}>{option.name} (15)</div>

            <div className="grid grid-cols-2 gap-8">
              <Table>
                {!simplyIfTwoOptions && (
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">90 Yes</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                )}
                <TableBody>
                  <TableRow>
                    <TableCell className="!pl-0">
                      <div className="flex flex-row items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" alt={`@case`} />
                          <AvatarFallback>ca</AvatarFallback>
                        </Avatar>

                        <div>
                          <div className="font-medium">case</div>
                          <div className="text-xs text-muted-foreground">@case</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="!pr-0 text-right">
                      <div>$250.00</div>
                      <div className="text-xs text-muted-foreground">14% profit</div>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="!pl-0">
                      <div className="flex flex-row items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" alt={`@TonyPepperoni`} />
                          <AvatarFallback>To</AvatarFallback>
                        </Avatar>

                        <div>
                          <div className="font-medium">TonyPepperoni</div>
                          <div className="text-xs text-muted-foreground">@TonyPepperoni</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="!pr-0 text-right">
                      <div>$150.00</div>
                      <div className="text-xs text-muted-foreground">76% profit</div>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="!pl-0">
                      <div className="flex flex-row items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" alt={`@strutheo`} />
                          <AvatarFallback>st</AvatarFallback>
                        </Avatar>

                        <div>
                          <div className="font-medium">strutheo</div>
                          <div className="text-xs text-muted-foreground">@strutheo</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="!pr-0 text-right">
                      <div>$10.00</div>
                      <div className="text-xs text-muted-foreground">20% profit</div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {!simplyIfTwoOptions && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">15 No</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">case</TableCell>
                      <TableCell className="text-right">$250.00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        ))} */}
      </CardContent>
    </Card>
  )
}
