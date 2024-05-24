'use client'

import { format } from 'date-fns'
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@play-money/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@play-money/ui/card'
import { Table, TableBody, TableRow, TableHeader, TableHead, TableCell } from '@play-money/ui/table'
import { Market } from './MarketOverviewPage'

export function MarketPositionsPage({ market }: { market: Market }) {
  const simplyIfTwoOptions = market.options.length === 2

  return (
    <Card className="flex-1">
      <CardHeader className="px-7">
        <CardTitle className="leading-relaxed">{market.question}</CardTitle>
        <div className="flex flex-row gap-4 text-muted-foreground">
          {market.closeDate ? <div>Closes {format(market.closeDate, 'MMM d, yyyy')}</div> : null}
          {/* <div>15 Traders</div>
          <div>$650 Volume</div> */}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 border-t pt-6">
        {market.options.map((option, i) => (
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
        ))}
      </CardContent>
    </Card>
  )
}
