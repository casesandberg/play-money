import { MessageSquareIcon, UsersIcon, DiamondIcon } from 'lucide-react'
import Link from 'next/link'
import { CurrencyDisplay } from '@play-money/finance/components/CurrencyDisplay'
import { UserAvatar } from '@play-money/ui/UserAvatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@play-money/ui/tooltip'
import { ExtendedMarket } from '../types'

export function MarketList({
  markets,
}: {
  markets: Array<ExtendedMarket & { commentCount: number; liquidityCount: number; uniqueTraderCount: number }>
}) {
  return (
    <div className="flex-1 space-y-4">
      {markets.map((market) => {
        const mostLikelyOption = market.options.reduce((prev, current) =>
          prev.probability > current.probability ? prev : current
        )

        return (
          <div className="border p-4" key={market.id}>
            <Link
              className="line-clamp-2 text-lg font-medium visited:text-muted-foreground"
              href={`/questions/${market.id}/${market.slug}`}
            >
              {market.question}
            </Link>

            <div className="flex min-h-5 gap-4 font-mono text-sm text-muted-foreground">
              <div className="flex gap-2 overflow-hidden">
                {market.marketResolution ? (
                  <div className="font-medium" style={{ color: market.marketResolution.resolution.color }}>
                    Resolved {market.marketResolution.resolution.name}
                  </div>
                ) : (
                  <div style={{ color: mostLikelyOption.color }} className="flex-shrink-0 font-medium">
                    {mostLikelyOption.probability}% {mostLikelyOption.name}
                  </div>
                )}
              </div>

              <div className="ml-auto flex flex-shrink-0 items-center gap-4">
                {market.commentCount ? (
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-1">
                        <MessageSquareIcon className="size-3" strokeWidth={3} />
                        {market.commentCount}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Comments</TooltipContent>
                  </Tooltip>
                ) : null}

                {market.uniqueTraderCount ? (
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-1">
                        <UsersIcon className="size-3" strokeWidth={3} />
                        {market.uniqueTraderCount}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Traders</TooltipContent>
                  </Tooltip>
                ) : null}

                {market.liquidityCount ? (
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-0">
                        <DiamondIcon className="size-3" strokeWidth={3} />
                        <CurrencyDisplay value={market.liquidityCount} isShort hasSymbol={false} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Liquidity</TooltipContent>
                  </Tooltip>
                ) : null}

                <Link href={`/${market.user.username}`}>
                  <UserAvatar user={market.user} size="sm" />
                </Link>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
