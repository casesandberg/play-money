'use client'

import React from 'react'
import { formatCurrency } from '../lib/formatCurrency'
import { useCurrencyContext } from './CurrencyProvider'

interface CurrencyDisplayProps {
  value: number
  currencyCode: string
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ value, currencyCode }) => {
  const { currencies, displayOptions } = useCurrencyContext()
  const currency = currencies[currencyCode]

  const formattedValue = formatCurrency(value, currency.imageUrl ? '' : currency.symbol, displayOptions.decimals)

  return (
    <div className="flex items-center space-x-1">
      {currency.imageUrl && <img src={currency.imageUrl} alt={currency.name} className="h-4 w-4" />}
      <span className="font-medium text-gray-700">{formattedValue}</span>
    </div>
  )
}
