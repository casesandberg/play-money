import { format } from 'date-fns'
import Decimal from 'decimal.js'
import _ from 'lodash'
import Link from 'next/link'
import React from 'react'
import {
  getMarketPositions,
  getLists,
  getUserMarkets,
  getUserPositions,
  getUserTransactions,
  getUserUsername,
} from '@play-money/api-helpers/client'
import { CurrencyDisplay } from '@play-money/finance/components/CurrencyDisplay'
import { calculateBalanceChanges, findBalanceChange } from '@play-money/finance/lib/helpers'
import { MarketProbabilityDetail } from '@play-money/markets/components/MarketProbabilityDetail'
import { Card, CardContent } from '@play-money/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@play-money/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@play-money/ui/tabs'
import { cn } from '@play-money/ui/utils'
import { useSearchParam } from '../../ui/src/hooks/useSearchParam'
import { UserGraph } from './UserGraph'
import { UserPositionsTable } from './UserPositionsTable'
import { UserProfileTabs } from './UserProfileTabs'

export async function UserTradesTable({ userId }: { userId: string }) {
  const { transactions } = await getUserTransactions({ userId })

  return (
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
                      {transaction.type === 'TRADE_BUY' ? 'Buy' : transaction.type === 'TRADE_SELL' ? 'Sell' : ''}{' '}
                      {_.truncate(optionName, { length: 30 })}
                    </div>
                    <div>
                      <CurrencyDisplay value={Math.abs(primaryChange?.change ?? 0)} isShort />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="line-clamp-2 font-medium">{transaction.market.question}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{format(transaction.createdAt, 'MMM d, yyyy')}</TableCell>
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
  )
}

export async function UserMarketsTable({ userId }: { userId: string }) {
  const { data: markets } = await getUserMarkets({ userId })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Question</TableHead>
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
  )
}

export async function UserListsTable({ userId }: { userId: string }) {
  const { data: lists } = await getLists({ ownerId: userId })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>List</TableHead>
          <TableHead className="hidden w-[250px] sm:table-cell">Options</TableHead>
          {/* <TableHead className="hidden sm:table-cell">Bonus</TableHead> */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {lists.length
          ? lists.map((list) => {
              return (
                <Link href={`/lists/${list.id}/${list.slug}`} legacyBehavior key={list.id}>
                  <TableRow className="cursor-pointer">
                    <TableCell>
                      <div className="line-clamp-2">{list.title}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Link className="block flex-1 p-2" href={`/lists/${list.id}/${list.slug}`}>
                        <span className="line-clamp-2 text-xs text-muted-foreground">
                          {list.markets.slice(0, 5).map((m) => (
                            <>
                              <div className="inline pr-1" key={m.market.id}>
                                <div
                                  className="mb-0.5 mr-1 inline-block size-1.5 flex-shrink-0 rounded-md"
                                  style={{ backgroundColor: m.market.options[0].color }}
                                />
                                {m.market.question}
                              </div>{' '}
                            </>
                          ))}
                        </span>
                      </Link>
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
  )
}

async function UserPositionsTab({
  userId,
  filters,
}: {
  userId: string
  filters?: {
    pageSize?: string
    page?: string
    status?: 'active' | 'closed' | 'all'
    sortField?: string
    sortDirection?: string
  }
}) {
  const { marketPositions, totalPages } = await getMarketPositions({
    ownerId: userId,
    ...filters,
    status: filters?.status ?? 'active',
  })

  return (
    <div className="mt-3 md:mt-6">
      <UserPositionsTable data={marketPositions} totalPages={totalPages} />
    </div>
  )
}

export async function UserProfilePage({
  username,
  filters,
}: {
  username: string
  filters?: {
    pageSize?: string
    page?: string
    status?: 'active' | 'closed' | 'all'
    sortField?: string
    sortDirection?: string
  }
}) {
  const user = await getUserUsername({ username })
  const { positions } = await getUserPositions({ userId: user.id, pageSize: 5 })
  const { data: markets } = await getUserMarkets({ userId: user.id })

  return (
    <div className="flex flex-col gap-4">
      <UserGraph userId={user.id} />

      <UserProfileTabs>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
            <TabsTrigger value="markets">Questions</TabsTrigger>
            <TabsTrigger value="lists">Lists</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="overview">
          <div className="flex flex-col gap-4 md:flex-row">
            <Card className="flex-1">
              <CardContent>
                <div className="my-4 text-lg font-semibold">Recent Positions</div>
                <div className="divide-y border-t">
                  {positions.length ? (
                    positions.map((position) => {
                      const value = new Decimal(position.value).toDecimalPlaces(4)
                      const cost = new Decimal(position.cost).toDecimalPlaces(4)
                      const change = value.sub(cost).div(cost).times(100).round().toNumber()
                      const changeLabel = `(${change > 0 ? '+' : ''}${change}%)`

                      return (
                        <Link
                          href={`/questions/${position.market.id}/${position.market.slug}`}
                          legacyBehavior
                          key={position.id}
                          className="cursor-pointer"
                        >
                          <div className="cursor-pointer py-2">
                            <div className="line-clamp-2 text-sm">
                              <span className="font-semibold">
                                <CurrencyDisplay value={Number(position.value)} />{' '}
                                {change ? (
                                  <span className={change > 0 ? 'text-lime-500' : 'text-red-400'}>{changeLabel}</span>
                                ) : null}
                              </span>{' '}
                              {position.option.name}
                            </div>
                            <div className="line-clamp-1 text-sm text-muted-foreground">{position.market.question}</div>
                          </div>
                        </Link>
                      )
                    })
                  ) : (
                    <div className="mt-4 text-center text-muted-foreground">No positions yet</div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardContent>
                <div className="my-4 text-lg font-semibold">Recent Questions</div>
                <div className="divide-y border-t">
                  {markets.length ? (
                    markets.slice(0, 5).map((market) => {
                      return (
                        <Link
                          href={`/questions/${market.id}/${market.slug}`}
                          legacyBehavior
                          key={market.id}
                          className="cursor-pointer"
                        >
                          <div className="cursor-pointer py-2">
                            <div className="line-clamp-2 text-sm">{market.question}</div>
                            <div className="line-clamp-1 text-sm text-muted-foreground">
                              <MarketProbabilityDetail options={market.options} size="sm" />
                            </div>
                          </div>
                        </Link>
                      )
                    })
                  ) : (
                    <div className="mt-4 text-center text-muted-foreground">No questions yet</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="trades">
          <Card>
            <CardContent>
              <UserTradesTable userId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="markets">
          <Card>
            <CardContent>
              <UserMarketsTable userId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lists">
          <Card>
            <CardContent>
              <UserListsTable userId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions">
          <Card>
            <CardContent>
              <UserPositionsTab userId={user.id} filters={filters} />
            </CardContent>
          </Card>
        </TabsContent>
      </UserProfileTabs>
    </div>
  )
}
