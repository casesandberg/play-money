'use client'

import { MoreVertical, Link, Pencil } from 'lucide-react'
import React from 'react'
import { Button } from '@play-money/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@play-money/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@play-money/ui/tooltip'
import { toast } from '@play-money/ui/use-toast'
import { useUser } from '@play-money/users/context/UserContext'
import { ExtendedList } from '../types'

export function ListToolbar({
  list,
  canEdit,
  onInitiateEdit,
}: {
  list: ExtendedList
  canEdit?: boolean
  onInitiateEdit: () => void
}) {
  const { user } = useUser()

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

          {canEdit ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onInitiateEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit list
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
