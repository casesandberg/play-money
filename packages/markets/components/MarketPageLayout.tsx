'use client'

import React from 'react'
import { ExtendedMarket } from './MarketOverviewPage'
import { MarketPageSidebar } from './MarketPageSidebar'
import { SidebarProvider } from './SidebarContext'

export function MarketPageLayout({
  market,
  children,
  activeOptionId,
}: {
  market: ExtendedMarket
  children: React.ReactNode
  activeOptionId: string
}) {
  return (
    <SidebarProvider>
      <main className="mx-auto flex flex-col gap-8 md:flex-row">
        {children}

        <div className="max-w-80 flex-1">
          <MarketPageSidebar market={market} activeOptionId={activeOptionId} />
        </div>
      </main>
    </SidebarProvider>
  )
}
