import { format } from 'date-fns'
import Link from 'next/link'
import React from 'react'
import { formatNumber } from '@play-money/currencies/lib/formatCurrency'
import { TransactionWithItems } from '@play-money/transactions/lib/getTransactions'
import { summarizeTransaction } from '@play-money/transactions/lib/helpers'
import { Card, CardContent } from '@play-money/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@play-money/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@play-money/ui/tabs'
import { cn } from '@play-money/ui/utils'
import { UserNotFoundError } from '../lib/exceptions'
import { UserProfile } from '../lib/sanitizeUser'

// TODO: @casesandberg Generate this from OpenAPI schema
export async function getUserProfile({ username }: { username: string }): Promise<UserProfile> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/username/${username}`, {
    credentials: 'include',
    cache: 'no-store', // If a user updates their profile, we want to get non-cahced data. Likely we should bust the cache there in the future.
  })
  if (!res.ok) {
    if (res.status === 404) {
      // TODO: @casesandberg Figure out how to pass around errors for next error boundaries
      // if (errorResponse?.error?.code === UserNotFoundError.code) {
      // throw new UserNotFoundError(errorResponse.error.message)
      throw new Error(UserNotFoundError.code)
    }

    throw new Error('There was an error fetching data')
  }

  return res.json()
}

export async function getUserTransactions({
  userId,
}: {
  userId: string
}): Promise<{ transactions: Array<TransactionWithItems> }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/${userId}/transactions`, {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error('There was an error fetching data')
  }

  return res.json()
}

export async function UserProfilePage({ username }: { username: string }) {
  const user = await getUserProfile({ username })
  const { transactions } = await getUserTransactions({ userId: user.id })

  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="trades">
        <div className="flex items-center">
          <TabsList>
            {/* <TabsTrigger value="net-worth">Net Worth</TabsTrigger> */}
            <TabsTrigger value="trades">Trades</TabsTrigger>
            {/* <TabsTrigger value="markets">Markets</TabsTrigger> */}
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
                      const summary = summarizeTransaction(transaction)
                      const userSummary = summary[transaction.creatorId]
                      return (
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
                                  transaction.type === 'MARKET_BUY'
                                    ? 'text-green-600'
                                    : transaction.type === 'MARKET_SELL'
                                      ? 'text-red-600'
                                      : ''
                                )}
                              >
                                {transaction.type === 'MARKET_BUY'
                                  ? 'Buy'
                                  : transaction.type === 'MARKET_SELL'
                                    ? 'Sell'
                                    : ''}{' '}
                                {!userSummary.YES.eq(0) ? 'Yes' : 'No'}
                              </div>
                              <div>${formatNumber(Math.abs(userSummary.PRIMARY.toNumber()))}</div>
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
                      )
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
                    <TableHead className="hidden sm:table-cell">Traders</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="line-clamp-2">
                        FDA legalizes magic mushrooms/psilocybin/etc. for clinical use by 2025
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">Mar 31, 2024</TableCell>
                    <TableCell className="hidden md:table-cell">58</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>
                      <div className="line-clamp-2">
                        Will it take more energy to cool and heat my hot tub, or keep it hot?
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">Mar 23, 2024</TableCell>
                    <TableCell className="hidden md:table-cell">5</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>
                      <div className="line-clamp-2">
                        Will it be possible to send mana to another user on 5th October 2024?
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">Mar 23, 2024</TableCell>
                    <TableCell className="hidden md:table-cell">2 </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
