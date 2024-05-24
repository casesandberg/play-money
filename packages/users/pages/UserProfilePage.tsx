import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@play-money/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@play-money/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@play-money/ui/tabs'
import { UserNotFoundError } from '../lib/exceptions'

// TODO: @casesandberg Generate this from OpenAPI schema
export async function getUserProfile({ username }: { username: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/username/${username}`, {
    credentials: 'include',
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

export async function UserProfilePage({ username }: { username: string }) {
  const data = await getUserProfile({ username })

  return (
    <div className="flex flex-col gap-4">
      {/* <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card className="sm:col-span-2" x-chunk="dashboard-05-chunk-0">
          <CardHeader className="pb-3">
            <CardTitle>Will Manifold have regular public stand-ups again in 2024?</CardTitle>
            <CardDescription className="max-w-lg text-balance leading-relaxed">5 traders. 3.9k volume.</CardDescription>
          </CardHeader>
        </Card>
        <Card x-chunk="dashboard-05-chunk-1">
          <CardHeader className="pb-2">
            <CardDescription>This Week</CardDescription>
            <CardTitle className="text-4xl">$1,329</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">+25% from last week</div>
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-05-chunk-2">
          <CardHeader className="pb-2">
            <CardDescription>This Month</CardDescription>
            <CardTitle className="text-4xl">$5,329</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">+10% from last month</div>
          </CardContent>
        </Card>
      </div> */}

      <Tabs defaultValue="trades">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="net-worth">Net Worth</TabsTrigger>
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
                    <TableHead className="table-cell w-[150px]">Date</TableHead>
                    <TableHead className="sm:table-cell">Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="sm:table-cell">
                      <div className="font-semibold text-green-600">Buy Yes</div>
                      <div>$500</div>
                    </TableCell>
                    <TableCell>
                      <div className="line-clamp-2">
                        FDA legalizes magic mushrooms/psilocybin/etc. for clinical use by 2025
                      </div>
                    </TableCell>
                    <TableCell className="table-cell">Mar 31, 2024</TableCell>
                    <TableCell className="table-cell">
                      <div className="font-semibold text-green-600">58%</div>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="sm:table-cell">
                      <div className="font-semibold text-green-600">Buy Yes</div>
                      <div>$10</div>
                    </TableCell>
                    <TableCell>
                      <div className="line-clamp-2">
                        Will it take more energy to cool and heat my hot tub, or keep it hot?
                      </div>
                    </TableCell>
                    <TableCell className="table-cell">Mar 23, 2024</TableCell>
                    <TableCell className="table-cell">
                      <div className="font-semibold text-red-600">-5%</div>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="sm:table-cell">
                      <div className="font-semibold text-red-600">Sell No</div>
                      <div>$50</div>
                    </TableCell>
                    <TableCell>
                      <div className="line-clamp-2">
                        Will it be possible to send mana to another user on 5th October 2024?
                      </div>
                    </TableCell>
                    <TableCell className="table-cell">Mar 23, 2024</TableCell>
                    <TableCell className="table-cell">
                      <div className="font-semibold text-green-600">15%</div>
                    </TableCell>
                  </TableRow>
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
