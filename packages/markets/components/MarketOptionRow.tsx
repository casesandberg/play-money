import React from 'react'
import { MarketOption } from '@play-money/database'
import { Button } from '@play-money/ui/button'
import { Progress } from '@play-money/ui/progress'
import { cn } from '@play-money/ui/utils'

export function MarketOptionRow({
  option,
  active,
  probability,
  className,
  onSelect,
}: {
  option: MarketOption & { color: string }
  active: boolean
  probability: number
  className?: string
  onSelect?: () => void
}) {
  return (
    <div
      className={cn(
        'flex cursor-pointer flex-row items-center gap-4 p-4 hover:bg-muted/50',
        active && 'bg-muted/50',
        className
      )}
      key={option.id}
      onClick={onSelect}
    >
      <div className="flex flex-1 flex-col gap-2">
        <div className="font-semibold leading-none">{option.name}</div>
        <div className="flex flex-row items-center gap-2">
          <div className="font-mono text-xs font-semibold leading-none" style={{ color: option.color }}>
            {Math.round(probability * 100)}%
          </div>
          <Progress
            className="h-2 max-w-[200px] transition-transform"
            data-color={option.color}
            indicatorStyle={{ backgroundColor: option.color }}
            value={probability * 100}
          />
        </div>
      </div>

      <Button size="sm" variant={active ? 'heavy' : 'outline'}>
        Select
      </Button>
    </div>
  )
}
