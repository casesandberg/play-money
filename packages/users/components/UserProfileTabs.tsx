'use client'

import React from 'react'
import { useSearchParam } from '@play-money/ui'
import { Tabs } from '@play-money/ui/tabs'

export function UserProfileTabs({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useSearchParam('tab')

  return (
    <Tabs defaultValue={tab || 'overview'} onValueChange={setTab}>
      {children}
    </Tabs>
  )
}
