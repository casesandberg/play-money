'use client'

import React from 'react'
import { SidebarProvider } from '@play-money/markets/components/SidebarContext'
import { useTrackResourceViewed } from '@play-money/notifications/hooks/useTrackResourceViewed'
import { SidebarReferralAlert } from '@play-money/referrals/components/SidebarReferralAlert'
import { SelectedItemsProvider } from '../../ui/src/contexts/SelectedItemContext'
import { ExtendedList } from '../types'
import { ListTradePanel } from './ListTradePanel'

export function ListPageLayout({
  list,
  children,
  onRevalidate,
}: {
  list: ExtendedList
  children: React.ReactNode
  onRevalidate: () => Promise<void>
}) {
  useTrackResourceViewed({ resourceId: list.id, resourceType: 'LIST' })

  return (
    <SelectedItemsProvider initialValue={[list.markets[0].market.id]}>
      <SidebarProvider>
        <main className="mx-auto flex w-full max-w-screen-lg flex-1 flex-col gap-8 md:flex-row">
          <div className="flex-1 space-y-2">{children}</div>

          <div className="w-full space-y-8 md:w-80">
            <SidebarReferralAlert />

            <ListTradePanel list={list} onTradeComplete={onRevalidate} />

            {/* <RelatedMarkets listId={list.id} /> */}
          </div>
        </main>
      </SidebarProvider>
    </SelectedItemsProvider>
  )
}
