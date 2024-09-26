'use client'

import { formatDistanceToNow } from 'date-fns'
import { EllipsisVerticalIcon } from 'lucide-react'
import React from 'react'
import { MarketProbabilityDetail } from '@play-money/markets/components/MarketProbabilityDetail'
import { ResolveMarketDialog } from '@play-money/markets/components/ResolveMarketDialog'
import { canModifyMarket } from '@play-money/markets/rules'
import { ExtendedMarket } from '@play-money/markets/types'
import { useSearchParam } from '@play-money/ui'
import { Button } from '@play-money/ui/button'
import { Checkbox } from '@play-money/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@play-money/ui/dropdown-menu'
import { cn } from '@play-money/ui/utils'
import { useUser } from '@play-money/users/context/UserContext'

export function ListMarketRow({
  market,
  active,
  className,
  canEdit = false,
  renderMenuItems,
  onRevalidate,
  onEdit,
  onSelect,
}: {
  market: ExtendedMarket
  active: boolean
  className?: string
  canEdit?: boolean
  renderMenuItems?: React.ReactNode
  onRevalidate?: () => void
  onEdit?: () => void
  onSelect?: () => void
}) {
  const { user } = useUser()
  const [isResolving, setResolving] = useSearchParam('resolve')
  const canResolve = user ? canModifyMarket({ market, user: user }) : false

  return (
    <div className={cn('flex cursor-pointer items-center hover:bg-muted/50', active && 'bg-muted/50', className)}>
      <div className="flex flex-1 flex-row items-center gap-3 p-3" onClick={onSelect}>
        <Checkbox variant="outline" checked={active} />
        <div className="flex flex-1 flex-col gap-1">
          <div className="line-clamp-2 font-semibold leading-none">{market.question}</div>
          {market.marketResolution ? (
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold">Resolved</span> {market.marketResolution.resolution.name}
            </div>
          ) : (
            <MarketProbabilityDetail options={market.options} size="sm" />
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" className="mr-2 size-6" variant="ghost">
            <EllipsisVerticalIcon className="size-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48" align="end">
          {canEdit ? (
            <>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          ) : null}
          {renderMenuItems}
          {canResolve ? (
            <>
              <DropdownMenuItem
                onClick={() => {
                  setResolving(market.id)
                }}
              >
                Resolve market
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : null}
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Created {formatDistanceToNow(market.createdAt, { addSuffix: true })}
          </DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>

      <ResolveMarketDialog
        market={market}
        open={isResolving === market.id}
        onClose={() => setResolving(undefined)}
        onSuccess={onRevalidate}
      />
    </div>
  )
}
