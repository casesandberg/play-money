import { format } from 'date-fns'
import _ from 'lodash'
import Link from 'next/link'
import React from 'react'
import { getUserMarkets, getUserTransactions, getUserUsername } from '@play-money/api-helpers/client'
import { CurrencyDisplay } from '@play-money/finance/components/CurrencyDisplay'
import { calculateBalanceChanges, findBalanceChange } from '@play-money/finance/lib/helpers'
import { Card, CardContent } from '@play-money/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@play-money/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@play-money/ui/tabs'
import { cn } from '@play-money/ui/utils'
import { UserGraph } from './UserGraph'

export async function UserProfilePage({ username }: { username: string }) {
  const user = await getUserUsername({ username })
  const { transactions } = await getUserTransactions({ userId: user.id })
  const { markets } = await getUserMarkets({ userId: user.id })

  return (
    <div className="flex flex-col gap-4">
      <UserGraph userId={user.id} />

      <Tabs defaultValue="trades">
        <div className="flex items-center">
          <TabsList>
            {/* <TabsTrigger value="net-worth">Net Worth</TabsTrigger> */}
            <TabsTrigger value="trades">Trades</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="net-worth">
          <Card>
            <CardContent>
              <div className="border-1 mt-6 h-80 w-full border bg-muted/50" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trades">
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="table-cell w-[100px]">Trade</TableHead>
                    <TableHead>Market</TableHead>
                    <TableHead className="hidden w-[150px] md:table-cell">Date</TableHead>
                    {/* <TableHead className="sm:table-cell">Profit</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
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
                      const optionName = transaction.options[0]?.name

                      return transaction.market ? (
                        <Link
                          href={`/questions/${transaction.market.id}/${transaction.market.slug}`}
                          legacyBehavior
                          key={transaction.id}
                        >
                          <TableRow className="cursor-pointer">
                            <TableCell className="sm:table-cell">
                              <div
                                className={cn(
                                  'font-semibold',
                                  transaction.type === 'TRADE_BUY'
                                    ? 'text-green-600'
                                    : transaction.type === 'TRADE_SELL'
                                      ? 'text-red-600'
                                      : ''
                                )}
                              >
                                {transaction.type === 'TRADE_BUY'
                                  ? 'Buy'
                                  : transaction.type === 'TRADE_SELL'
                                    ? 'Sell'
                                    : ''}{' '}
                                {_.truncate(optionName, { length: 30 })}
                              </div>
                              <div>
                                <CurrencyDisplay value={Math.abs(primaryChange?.change ?? 0)} isShort />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="line-clamp-2 font-medium">{transaction.market.question}</div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {format(transaction.createdAt, 'MMM d, yyyy')}
                            </TableCell>
                            {/* <TableCell className="table-cell">
                            <div className="font-semibold text-green-600">58%</div>
                          </TableCell> */}
                          </TableRow>
                        </Link>
                      ) : null
                    })
                  ) : (
                    <TableRow>
                      <TableCell className="sm:table-cell"></TableCell>
                      <TableCell className="text-center">No transactions yet</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="markets">
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Market</TableHead>
                    <TableHead className="hidden w-[150px] sm:table-cell">Resolves</TableHead>
                    {/* <TableHead className="hidden sm:table-cell">Bonus</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {markets.length
                    ? markets.map((market) => {
                        return (
                          <Link href={`/questions/${market.id}/${market.slug}`} legacyBehavior key={market.id}>
                            <TableRow className="cursor-pointer">
                              <TableCell>
                                <div className="line-clamp-2">{market.question}</div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {market.closeDate ? format(market.closeDate, 'MMM d, yyyy') : '-'}
                              </TableCell>
                              {/* <TableCell className="hidden md:table-cell">
                                <MarketUserTraderBonusAmount marketId={market.id} />
                              </TableCell> */}
                            </TableRow>
                          </Link>
                        )
                      })
                    : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
