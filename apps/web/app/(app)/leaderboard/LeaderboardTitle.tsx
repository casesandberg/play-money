'use client'

import { InfoIcon } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from '@play-money/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@play-money/ui/popover'

export function LeaderboardTitle({ title, description }: { title: string; description: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center justify-between rounded-t-lg border-b bg-muted px-4 py-2 pr-1 pt-8">
      <h4 className="text-lg font-semibold">{title}</h4>

      <Popover open={open}>
        <PopoverTrigger asChild>
          <Button
            onClick={() => {
              setOpen(!open)
            }}
            onKeyDown={(e) => {
              e.preventDefault()
              e.key === 'Enter' && setOpen(!open)
            }}
            onMouseEnter={() => {
              setOpen(true)
            }}
            onMouseLeave={() => {
              setOpen(false)
            }}
            onTouchStart={() => {
              setOpen(!open)
            }}
            size="icon"
            variant="ghost"
          >
            <InfoIcon className="size-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="max-w-sm text-sm">{description}</PopoverContent>
      </Popover>
    </div>
  )
}
