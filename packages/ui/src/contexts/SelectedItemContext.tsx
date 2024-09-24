'use client'

import React, { createContext, useContext } from 'react'
import { useSearchParam } from '../hooks/useSearchParam'

interface SelectedItemsContextProps {
  selected: Array<string>
  setSelected: (value: Array<string>) => void
}

const SelectedItemsContext = createContext<SelectedItemsContextProps | undefined>(undefined)

export function SelectedItemsProvider({
  children,
  initialValue,
}: {
  children: React.ReactNode
  initialValue?: Array<string>
}) {
  const [stringSelected, setStringSelected] = useSearchParam('selected', 'replace')

  const selected = stringSelected ? stringSelected.split(',') : initialValue || []
  function setSelected(value: Array<string>) {
    setStringSelected(value.join(','))
  }

  return <SelectedItemsContext.Provider value={{ selected, setSelected }}>{children}</SelectedItemsContext.Provider>
}

export function useSelectedItems(): SelectedItemsContextProps {
  const context = useContext(SelectedItemsContext)
  if (!context) {
    throw new Error('useSelectedItems must be used within a SelectedItemsProvider')
  }
  return context
}
