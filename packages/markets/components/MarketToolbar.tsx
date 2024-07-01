'use client'

import { MoreVertical, Link } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import React, { useCallback } from 'react'
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
import { canResolveMarket } from '../lib/helpers'
import { ExtendedMarket } from './MarketOverviewPage'
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

export function MarketToolbar({ market }: { market: ExtendedMarket }) {
  const { user } = useUser()
  const [isResolving, setResolving] = useQueryString('resolve')
  const canResolve = canResolveMarket({ market, userId: user?.id })

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast({ title: 'Link copied to clipboard!' })
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className="flex items-center justify-end">
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
          {canResolve ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setResolving('true')
                }}
              >
                Resolve market
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <ResolveMarketDialog market={market} open={isResolving === 'true'} onClose={() => setResolving(undefined)} />
    </div>
  )
}
