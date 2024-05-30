'use client'

import _ from 'lodash'
import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Currency } from '@play-money/database'

type DisplayOptions = {
  decimals: number
}

type CurrencyContextType = {
  currencies: Record<string, Currency>
  displayOptions: DisplayOptions
  updateDisplayOptions: (newOptions: Partial<DisplayOptions>) => void
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export const CurrencyProvider = ({ children, currencies }: { children: ReactNode; currencies: Array<Currency> }) => {
  const [displayOptions, setDisplayOptions] = useState<DisplayOptions>({ decimals: 0 })

  const updateDisplayOptions = (newOptions: Partial<DisplayOptions>) => {
    setDisplayOptions((prevOptions) => ({ ...prevOptions, ...newOptions }))
  }

  const currenciesByCode = _.keyBy(currencies, 'code') as unknown as Record<string, Currency>

  return (
    <CurrencyContext.Provider value={{ currencies: currenciesByCode, displayOptions, updateDisplayOptions }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrencyContext = (): CurrencyContextType => {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrencyContext must be used within a CurrencyProvider')
  }
  return context
}
