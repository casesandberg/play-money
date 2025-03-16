'use client'

import { MoreVertical, Link, Pencil } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import React, { useCallback } from 'react'
import { updateMarket } from '@play-money/api-helpers/client'
import { Button } from '@play-money/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@play-money/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@play-money/ui/tooltip'
import { toast } from '@play-money/ui/use-toast'
import { useUser } from '@play-money/users/context/UserContext'
import { canModifyMarket } from '../rules'
import { ExtendedMarket } from '../types'
import { CancelMarketDialog } from './CancelMarketDialog'
import { ResolveMarketDialog } from './ResolveMarketDialog'

function useQueryString(key: string) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setQueryString = useCallback(
    (value?: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }

      router.push(pathname + '?' + params.toString())
    },
    [searchParams]
  )

  return [searchParams.get(key), setQueryString] as const
}

export function MarketToolbar({
  market,
  canEdit,
  onInitiateEdit,
  onInitiateBoost,
  onRevalidate,
}: {
  market: ExtendedMarket
  canEdit?: boolean
  onInitiateEdit?: () => void
  onInitiateBoost?: () => void
  onRevalidate?: () => void
}) {
  const { user } = useUser()
  const [isResolving, setResolving] = useQueryString('resolve')
  const [isCanceling, setCanceling] = useQueryString('cancel')
  const canResolve = user ? canModifyMarket({ market, user: user }) : false
  const canCancel = user ? canModifyMarket({ market, user: user }) : false

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast({ title: 'Link copied to clipboard!' })
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleCopyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.href}?ref=${user?.referralCode}`)
      toast({ title: 'Referral link copied to clipboard!' })
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleHalt = async () => {
    await updateMarket({ marketId: market.id, body: { closeDate: new Date() } })
    onRevalidate?.()
  }

  return (
    <div className="flex items-center justify-end">
      {canEdit ? (
        <Button variant="ghost" size="sm" onClick={onInitiateEdit}>
          <Pencil className="h-4 w-4" />
          <span>Edit</span>
        </Button>
      ) : null}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleCopyLink}>
            <Link className="h-4 w-4" />
            <span className="sr-only">Share</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy link</TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCopyLink}>Copy link</DropdownMenuItem>
          {user ? <DropdownMenuItem onClick={handleCopyReferralLink}>Copy referral link</DropdownMenuItem> : null}
          {!market.resolvedAt && !market.canceledAt ? (
            <DropdownMenuItem onClick={onInitiateBoost}>Liquidity boost</DropdownMenuItem>
          ) : null}

          {canResolve ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleHalt}
                disabled={!!market.closeDate && new Date() > new Date(market.closeDate)}
              >
                Halt trading
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setResolving('true')
                }}
              >
                Resolve market
              </DropdownMenuItem>
            </>
          ) : null}
          {canEdit ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onInitiateEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit market
              </DropdownMenuItem>
            </>
          ) : null}

          {canCancel ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setCanceling('true')
                }}
                className="text-destructive"
              >
                Cancel market
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <ResolveMarketDialog
        market={market}
        open={isResolving === 'true' && canResolve}
        onClose={() => setResolving(undefined)}
        onSuccess={onRevalidate}
      />

      <CancelMarketDialog
        market={market}
        open={isCanceling === 'true' && canCancel}
        onClose={() => setCanceling(undefined)}
        onSuccess={onRevalidate}
      />
    </div>
  )
}
