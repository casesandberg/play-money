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
      <main className="mx-auto flex max-w-screen-lg flex-1 flex-row items-start gap-8 p-4 sm:px-6 sm:py-0 md:gap-8">
        {children}

        <div className="max-w-80 flex-1">
          <MarketPageSidebar market={market} activeOptionId={activeOptionId} />
        </div>
      </main>
    </SidebarProvider>
  )
}
