import React from 'react'
import { formatCurrency, formatNumber } from '@play-money/finance/lib/formatCurrency'
import { cn } from '@play-money/ui/utils'

export function CurrencyDisplay({
  value,
  className,
  hasSymbol = true,
  isShort = false,
}: {
  value: number
  className?: string
  hasSymbol?: boolean
  isShort?: boolean
}) {
  const formattedValue = formatCurrency(value, '', 0)
  const formattedShort = formatNumber(value)

  return (
    <span className={cn('whitespace-nowrap font-mono', className)}>
      <span className="inline-block -translate-y-[5%] pr-0.5 leading-none">{hasSymbol ? '🎃' : null}</span>
      {isShort ? formattedShort : formattedValue}
    </span>
  )
}
