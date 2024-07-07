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
      <main className="mx-auto flex w-full max-w-screen-lg flex-1 flex-col gap-8 md:flex-row">
        {children}

        <div className="w-80">
          <MarketPageSidebar market={market} activeOptionId={activeOptionId} />
        </div>
      </main>
    </SidebarProvider>
  )
}
