'use client'

import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import React from 'react'
import { Tabs, TabsList, TabsTrigger } from '@play-money/ui/tabs'
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
  const router = useRouter()
  const pathname = usePathname()

  const initialTab = pathname.includes('/trades') ? 'trades' : 'overview'

  const handleTabChange = (value: string) => {
    if (value === 'overview') {
      router.push(`/questions/${market.id}/${market.slug}`)
    } else if (value === 'trades') {
      router.push(`/questions/${market.id}/${market.slug}/trades`)
    }
  }

  return (
    <SidebarProvider>
      <main className="mx-auto flex w-full max-w-screen-lg flex-1 flex-col gap-8 md:flex-row">
        <div className="flex-1 space-y-2">
          <Tabs defaultValue={initialTab} className="w-[400px]" onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trades">Trades</TabsTrigger>
            </TabsList>
          </Tabs>
          {children}
        </div>

        <div className="w-full md:w-80">
          <MarketPageSidebar market={market} activeOptionId={activeOptionId} />
        </div>
      </main>
    </SidebarProvider>
  )
}
