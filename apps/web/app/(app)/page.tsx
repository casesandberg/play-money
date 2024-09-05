import { formatDistanceToNow } from 'date-fns'
import { Maximize2Icon, MinusIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { getMarkets } from '@play-money/api-helpers/client'
import { RecentLiquidity } from '@play-money/finance/components/RecentLiquidity'
import { RecentTrades } from '@play-money/finance/components/RecentTrades'
import { UserQuestCard } from '@play-money/quests/components/UserQuestCard'
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
              const isBinaryMarket = market.options.length === 2
              const firstOption = market.options[0]
              const sortedOptions = market.options.sort((a, b) => (b.probability || 0) - (a.probability || 0))

              return (
                <div className="flex flex-col transition-colors hover:bg-muted/50 sm:flex-row" key={market.id}>
                  <Link
                    className="m-2 mb-0 ml-3 line-clamp-2 flex-1 sm:mb-2"
                    href={`/questions/${market.id}/${market.slug}`}
                  >
                    {market.question}
                  </Link>

                  <div className="flex flex-1">
                    <Link className="flex-1 p-2" href={`/questions/${market.id}/${market.slug}`}>
                      {isBinaryMarket ? (
                        <div className="flex flex-row items-center gap-2">
                          <div style={{ color: firstOption.color }}>{firstOption.probability}%</div>
                          <Progress
                            className="h-2 max-w-[150px] transition-transform"
                            data-color={firstOption.color}
                            indicatorStyle={{ backgroundColor: firstOption.color }}
                            value={firstOption.probability}
                          />
                        </div>
                      ) : (
                        <div className="line-clamp-2 text-muted-foreground">
                          <span className="pr-4" style={{ color: sortedOptions[0].color }}>
                            {sortedOptions[0].probability}% {sortedOptions[0].name}
                          </span>
                          {/* <span style={{ color: sortedOptions[1].color }}>
                {sortedOptions[1].probability}% {sortedOptions[1].name}
              </span> */}
                        </div>
                      )}
                    </Link>
                    <div className="p-2 pr-3">
                      {market.closeDate ? (
                        <div className="text-muted-foreground">{`in ${formatDistanceToNow(market.closeDate)}`}</div>
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
              const isBinaryMarket = market.options.length === 2
              const firstOption = market.options[0]
              const sortedOptions = market.options.sort((a, b) => (b.probability || 0) - (a.probability || 0))

              return (
                <div className="flex flex-col transition-colors hover:bg-muted/50 sm:flex-row" key={market.id}>
                  <Link
                    className="m-2 mb-0 ml-3 line-clamp-2 flex-1 sm:mb-2"
                    href={`/questions/${market.id}/${market.slug}`}
                  >
                    {market.question}
                  </Link>

                  <div className="flex flex-1">
                    <Link className="flex-1 p-2" href={`/questions/${market.id}/${market.slug}`}>
                      {isBinaryMarket ? (
                        <div className="flex flex-row items-center gap-2">
                          <div style={{ color: firstOption.color }}>{firstOption.probability}%</div>
                          <Progress
                            className="h-2 max-w-[150px] transition-transform"
                            data-color={firstOption.color}
                            indicatorStyle={{ backgroundColor: firstOption.color }}
                            value={firstOption.probability}
                          />
                        </div>
                      ) : (
                        <div className="line-clamp-2 text-muted-foreground">
                          <span className="pr-4" style={{ color: sortedOptions[0].color }}>
                            {sortedOptions[0].probability}% {sortedOptions[0].name}
                          </span>
                          {/* <span style={{ color: sortedOptions[1].color }}>
                {sortedOptions[1].probability}% {sortedOptions[1].name}
              </span> */}
                        </div>
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
