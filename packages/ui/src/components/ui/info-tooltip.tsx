import { InfoIcon } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from '@play-money/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@play-money/ui/popover'

export function InfoTooltip({ description }: { description: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open}>
      <PopoverTrigger asChild>
        <Button
          className="size-5"
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
  )
}
