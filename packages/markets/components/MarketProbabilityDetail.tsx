import React from 'react'
import { MarketOption } from '@play-money/database'
import { Progress } from '@play-money/ui/progress'
import { cn } from '@play-money/ui/utils'

export function formatProbability(probability: number | null) {
  if (probability === null) {
    return ''
  }
  const roundedProbability = Math.round(probability)

  if (roundedProbability === 0) {
    return '<1%'
  }
  if (roundedProbability === 100) {
    return '>99%'
  }
  return `${roundedProbability}%`
}

export function MarketProbabilityDetail({
  options,
  size = 'md',
}: {
  options: Array<MarketOption>
  size?: 'sm' | 'md'
}) {
  const createdOrderOptions = options.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  if (createdOrderOptions.length === 1 || createdOrderOptions.length === 2) {
    const option = createdOrderOptions[0]
    return (
      <div className="flex flex-row items-center gap-2">
        <div
          className={cn('font-mono font-semibold leading-none', size === 'sm' && 'text-xs')}
          style={{ color: option.color }}
        >
          {formatProbability(option.probability)}
        </div>
        <Progress
          className="h-2 max-w-[150px] transition-transform"
          data-color={option.color}
          indicatorStyle={{ backgroundColor: option.color }}
          value={option.probability}
        />
      </div>
    )
  }

  const optionsByProbability = createdOrderOptions.sort((a, b) => (b.probability || 0) - (a.probability || 0))
  const highestProbabilityOption = optionsByProbability[0]
  return (
    <div className="line-clamp-2 text-muted-foreground">
      <span className="pr-4" style={{ color: highestProbabilityOption.color }}>
        <span className={cn('font-mono font-semibold leading-none', size === 'sm' && 'text-xs')}>
          {formatProbability(highestProbabilityOption.probability)}
        </span>{' '}
        {highestProbabilityOption.name}
      </span>
    </div>
  )
}
