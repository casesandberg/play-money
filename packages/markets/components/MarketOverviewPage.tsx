'use client'

import { format, isPast } from 'date-fns'
import _ from 'lodash'
import { CircleCheckBig, ChevronDown, Link2Icon, PlusIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { mutate } from 'swr'
import { createComment } from '@play-money/api-helpers/client'
import {
  MARKET_BALANCE_PATH,
  MARKET_GRAPH_PATH,
  MY_BALANCE_PATH,
  useMarketBalance,
} from '@play-money/api-helpers/client/hooks'
import { CreateCommentForm } from '@play-money/comments/components/CreateCommentForm'
import { CurrencyDisplay } from '@play-money/finance/components/CurrencyDisplay'
import { marketOptionBalancesToProbabilities } from '@play-money/finance/lib/helpers'
import { UserAvatar } from '@play-money/ui/UserAvatar'
import { Alert, AlertDescription, AlertTitle } from '@play-money/ui/alert'
import { Badge } from '@play-money/ui/badge'
import { Button } from '@play-money/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@play-money/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@play-money/ui/collapsible'
import { ReadMoreEditor } from '@play-money/ui/editor'
import { toast } from '@play-money/ui/use-toast'
import { UserLink } from '@play-money/users/components/UserLink'
import { useUser } from '@play-money/users/context/UserContext'
import { useSelectedItems } from '../../ui/src/contexts/SelectedItemContext'
import { useSearchParam } from '../../ui/src/hooks/useSearchParam'
import { canModifyMarket } from '../rules'
import { ExtendedMarket } from '../types'
import { EditMarketDialog } from './EditMarketDialog'
import { EditMarketOptionDialog } from './EditMarketOptionDialog'
import { LiquidityBoostAlert } from './LiquidityBoostAlert'
import { LiquidityBoostDialog } from './LiquidityBoostDialog'
import { MarketGraph } from './MarketGraph'
import { MarketOptionRow } from './MarketOptionRow'
import { MarketToolbar } from './MarketToolbar'
import { useSidebar } from './SidebarContext'

function getTextContrast(hex: string): string {
  const r = parseInt(hex.substring(1, 3), 16)
  const g = parseInt(hex.substring(3, 5), 16)
  const b = parseInt(hex.substring(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance > 0.5 ? '#000' : '#FFF'
}

export function MarketOverviewPage({
  market,
  renderActivitiy,
  onRevalidate,
}: {
  market: ExtendedMarket
  renderActivitiy: React.ReactNode
  onRevalidate: () => Promise<void>
}) {
  const { user } = useUser()
  const { selected, setSelected } = useSelectedItems()
  const { triggerEffect } = useSidebar()
  const { data: balance } = useMarketBalance({ marketId: market.id })
  const [isEditing, setIsEditing] = useSearchParam('edit')
  const [isEditOption, setIsEditOption] = useSearchParam('editOption')
  const [isBoosting, setIsBoosting] = useSearchParam('boost')
  const isCreator = user?.id === market.createdBy
  const probabilities = marketOptionBalancesToProbabilities(balance?.amm)

  const mostLikelyOption = market.options.reduce((prev, current) =>
    (prev.probability || 0) > (current.probability || 0) ? prev : current
  )

  const orderedMarketOptions = _.orderBy(market.options, 'createdAt')

  const handleRevalidateBalance = async () => {
    void onRevalidate?.()
    void mutate(MY_BALANCE_PATH)
    void mutate(MARKET_BALANCE_PATH(market.id))
    void mutate(MARKET_GRAPH_PATH(market.id))
  }

  const handleCreateComment = async (content: string) => {
    try {
      await createComment({ content, entity: { type: 'MARKET', id: market.id } })
      onRevalidate()
    } catch (error) {
      toast({
        title: 'There was an error creating your comment',
        description: (error as Error).message,
      })
    }
  }

  return (
    <Card className="flex-1">
      <MarketToolbar
        market={market}
        canEdit={user ? canModifyMarket({ market, user }) : false}
        onInitiateEdit={() => setIsEditing('true')}
        onInitiateBoost={() => setIsBoosting('true')}
        onRevalidate={handleRevalidateBalance}
      />

      <CardHeader className="pt-0 md:pt-0">
        {market.parentList ? (
          <Link
            href={`/lists/${market.parentList.id}/${market.parentList.slug}`}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <Link2Icon className="size-5" />
            {market.parentList.title}
          </Link>
        ) : null}
        <CardTitle className="leading-relaxed">{market.question}</CardTitle>
        <div className="flex flex-row flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground md:flex-nowrap">
          {market.canceledAt ? (
            <div className="text-muted-foreground">
              <span className="font-semibold">Canceled</span>
            </div>
          ) : null}
          {!market.marketResolution && !market.canceledAt ? (
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
          {/* <div>15 Traders</div>
          <div>$650 Volume</div> */}
        </div>
      </CardHeader>
      <CardContent>
        <MarketGraph market={market} activeOptionId={selected[0]} />
      </CardContent>

      <CardContent>
        {market.marketResolution ? (
          <>
            <Alert>
              <CircleCheckBig style={{ color: market.marketResolution.resolution.color }} className="h-4 w-4" />
              <AlertTitle className="flex justify-between">
                <span className="text-lg leading-none">{market.marketResolution.resolution.name}</span>
                <Badge
                  style={{
                    backgroundColor: market.marketResolution.resolution.color,
                    color: getTextContrast(market.marketResolution.resolution.color),
                  }}
                >
                  Resolved
                </Badge>
              </AlertTitle>
              <AlertDescription className="text-muted-foreground">
                By <UserLink user={market.marketResolution.resolvedBy} /> on{' '}
                {format(market.marketResolution.updatedAt, 'MMM d, yyyy')}
              </AlertDescription>
              {market.marketResolution.supportingLink ? (
                <AlertDescription>
                  <a
                    href={market.marketResolution.supportingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    {market.marketResolution.supportingLink}
                  </a>
                </AlertDescription>
              ) : null}
            </Alert>
            {orderedMarketOptions.length ? (
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="text-muted-foreground" size="sm">
                    View more <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Card>
                    {orderedMarketOptions.map((option, i) => (
                      <MarketOptionRow
                        key={option.id}
                        option={option}
                        active={option.id === selected[0]}
                        probability={probabilities[option.id] || option.probability || 0}
                        className={i > 0 ? 'border-t' : ''}
                        canEdit={user ? canModifyMarket({ market, user }) : false}
                        onEdit={() => setIsEditOption(option.id)}
                        onSelect={() => {
                          setSelected([option.id])
                          triggerEffect()
                        }}
                      />
                    ))}
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            ) : null}
          </>
        ) : orderedMarketOptions.length ? (
          <Card>
            {orderedMarketOptions.map((option, i) => (
              <MarketOptionRow
                key={option.id}
                option={option}
                active={option.id === selected[0]}
                probability={probabilities[option.id] || option.probability || 0}
                className={i > 0 ? 'border-t' : ''}
                canEdit={user ? canModifyMarket({ market, user }) : false}
                onEdit={() => setIsEditOption(option.id)}
                onSelect={() => {
                  setSelected([option.id])
                  triggerEffect()
                }}
              />
            ))}
          </Card>
        ) : null}
      </CardContent>

      <CardContent className="space-y-2">
        {market.description ? <ReadMoreEditor value={market.description} maxLines={6} /> : null}

        {market.tags.length ? (
          <div className="flex flex-wrap gap-2">
            {market.tags.map((tag) => (
              <Link href={`/questions/tagged/${tag}`} key={tag}>
                <Badge variant="secondary">{tag}</Badge>
              </Link>
            ))}
          </div>
        ) : null}
      </CardContent>

      {!market.resolvedAt && !market.canceledAt ? (
        <CardContent>
          <LiquidityBoostAlert onClick={() => setIsBoosting('true')} />
        </CardContent>
      ) : null}

      <Collapsible>
        <div className="flex flex-row items-center justify-between px-6 ">
          <div className="text-lg font-semibold">Activity</div>
          <CollapsibleTrigger asChild>
            <Button size="sm" type="button" variant="secondary">
              <PlusIcon className="h-4 w-4" /> Comment
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="mt-2 px-6">
          <CreateCommentForm onSubmit={handleCreateComment} />
        </CollapsibleContent>
      </Collapsible>
      {renderActivitiy}

      <EditMarketDialog
        key={market.updatedAt.toString()} // reset form when market updates
        market={market}
        open={isEditing === 'true'}
        onClose={() => setIsEditing(undefined)}
        onSuccess={onRevalidate}
      />
      <EditMarketOptionDialog
        market={market}
        optionId={isEditOption!}
        open={isEditOption != null}
        onClose={() => setIsEditOption(undefined)}
        onSuccess={onRevalidate}
      />
      <LiquidityBoostDialog
        market={market}
        open={isBoosting === 'true'}
        onClose={() => setIsBoosting(undefined)}
        onSuccess={handleRevalidateBalance}
      />
    </Card>
  )
}
