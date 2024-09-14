import { Maximize2Icon, MinusIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { getMarkets } from '@play-money/api-helpers/client'
import { RecentLiquidity } from '@play-money/finance/components/RecentLiquidity'
import { RecentTrades } from '@play-money/finance/components/RecentTrades'
import { MarketProbabilityDetail } from '@play-money/markets/components/MarketProbabilityDetail'
import { UserQuestCard } from '@play-money/quests/components/UserQuestCard'
import { formatDistanceToNowShort } from '@play-money/ui'
import { UserAvatar } from '@play-money/ui/UserAvatar'
import { Button } from '@play-money/ui/button'
import { Card } from '@play-money/ui/card'
import { Progress } from '@play-money/ui/progress'

export default async function AppPage() {
  const { markets: closingMarkets } = await getMarkets({ sortField: 'closeDate', sortDirection: 'asc', pageSize: '5' })
  const { markets: newMarkets } = await getMarkets({ pageSize: '10' })

  return (
    <div className="mx-auto flex max-w-screen-lg flex-1 flex-col gap-8 md:flex-row">
      <div className="flex flex-1 flex-col gap-4">
        <Card>
          <div className="flex items-center justify-between rounded-t-lg border-b bg-muted pl-4 pr-2">
            <h4 className="py-3 text-lg font-semibold">Closing soon</h4>

            <Link href="/questions?sort=closeDate-asc">
              <Button size="icon" variant="ghost">
                <Maximize2Icon className="size-4 text-muted-foreground" />
              </Button>
            </Link>
          </div>

          <div className="divide-y font-mono text-sm">
            {closingMarkets.map((market) => {
              return (
                <div className="flex flex-col transition-colors hover:bg-muted/50 sm:flex-row" key={market.id}>
                  <Link
                    className="m-2 mb-0 ml-3 line-clamp-2 flex-[3] visited:text-muted-foreground sm:mb-2"
                    href={`/questions/${market.id}/${market.slug}`}
                  >
                    {market.question}
                  </Link>

                  <div className="flex flex-[2]">
                    <Link className="flex-1 p-2" href={`/questions/${market.id}/${market.slug}`}>
                      {market.marketResolution ? (
                        <div className="text-muted-foreground">
                          <span className="font-semibold">Resolved</span> {market.marketResolution.resolution.name}
                        </div>
                      ) : (
                        <MarketProbabilityDetail options={market.options} />
                      )}
                    </Link>
                    <div className="p-2 pr-3">
                      {market.closeDate ? (
                        <div className="text-muted-foreground">{formatDistanceToNowShort(market.closeDate)}</div>
                      ) : (
                        <MinusIcon className="h-4 w-4 text-muted-foreground/50" />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between rounded-t-lg border-b bg-muted pl-4 pr-2">
            <h4 className="py-3 text-lg font-semibold">New questions</h4>

            <Link href="/questions">
              <Button size="icon" variant="ghost">
                <Maximize2Icon className="size-4 text-muted-foreground" />
              </Button>
            </Link>
          </div>

          <div className="divide-y font-mono text-sm">
            {newMarkets.map((market) => {
              return (
                <div className="flex flex-col transition-colors hover:bg-muted/50 sm:flex-row" key={market.id}>
                  <Link
                    className="m-2 mb-0 ml-3 line-clamp-2 flex-[3] visited:text-muted-foreground sm:mb-2"
                    href={`/questions/${market.id}/${market.slug}`}
                  >
                    {market.question}
                  </Link>

                  <div className="flex flex-[2]">
                    <Link className="flex-1 p-2" href={`/questions/${market.id}/${market.slug}`}>
                      {market.marketResolution ? (
                        <div className="text-muted-foreground">
                          <span className="font-semibold">Resolved</span> {market.marketResolution.resolution.name}
                        </div>
                      ) : (
                        <MarketProbabilityDetail options={market.options} />
                      )}
                    </Link>
                    <div className="p-2 pr-3">
                      <Link href={`/${market.user.username}`}>
                        <UserAvatar size="sm" user={market.user} />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <div className="space-y-8 md:w-80">
        <UserQuestCard />
        <div>
          <div className="pb-2 text-xs font-semibold uppercase text-muted-foreground">Recent trades</div>
          <RecentTrades />
        </div>

        <div>
          <div className="pb-2 text-xs font-semibold uppercase text-muted-foreground">New liquidity</div>
          <RecentLiquidity />
        </div>
      </div>
    </div>
  )
}
