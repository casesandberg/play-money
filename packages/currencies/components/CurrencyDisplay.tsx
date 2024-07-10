'use client'

import React from 'react'
import { cn } from '@play-money/ui/utils'
import { formatCurrency } from '../lib/formatCurrency'
import { useCurrencyContext } from './CurrencyProvider'

interface CurrencyDisplayProps {
  value: number
  currencyCode: string
  className?: string
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ value, currencyCode, className }) => {
  const { currencies, displayOptions } = useCurrencyContext()
  const currency = currencies[currencyCode]

  const formattedValue = formatCurrency(value, currency.imageUrl ? '' : currency.symbol, displayOptions.decimals)

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {currency.imageUrl && <img src={currency.imageUrl} alt={currency.name} className="h-4 w-4" />}
      <span className="font-medium">{formattedValue}</span>
    </div>
  )
}
