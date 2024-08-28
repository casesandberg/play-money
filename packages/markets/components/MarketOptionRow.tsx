import { formatDistanceToNow } from 'date-fns'
import { EllipsisVerticalIcon } from 'lucide-react'
import React from 'react'
import { MarketOption } from '@play-money/database'
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
import { Progress } from '@play-money/ui/progress'
import { cn } from '@play-money/ui/utils'

export function MarketOptionRow({
  option,
  active,
  probability,
  className,
  canEdit = false,
  onEdit,
  onSelect,
}: {
  option: MarketOption
  active: boolean
  probability: number
  className?: string
  canEdit?: boolean
  onEdit?: () => void
  onSelect?: () => void
}) {
  return (
    <div
      className={cn('flex cursor-pointer items-center hover:bg-muted/50', active && 'bg-muted/50', className)}
      key={option.id}
    >
      <div className="flex flex-1 flex-row items-center gap-3 p-3" onClick={onSelect}>
        <Checkbox variant="outline" checked={active} />
        <div className="flex flex-1 flex-col gap-1">
          <div className="line-clamp-2 font-semibold leading-none">{option.name}</div>
          <div className="flex flex-row items-center gap-2">
            <div className="font-mono text-xs font-semibold leading-none" style={{ color: option.color }}>
              {probability}%
            </div>
            <Progress
              className="h-2 max-w-[200px] transition-transform"
              data-color={option.color}
              indicatorStyle={{ backgroundColor: option.color }}
              value={probability}
            />
          </div>
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
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Created {formatDistanceToNow(option.createdAt, { addSuffix: true })}
          </DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
