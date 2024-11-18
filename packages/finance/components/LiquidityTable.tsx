'use client'

import { ColumnDef } from '@tanstack/react-table'
import _ from 'lodash'
import React from 'react'
import { User } from '@play-money/database'
import { CurrencyDisplay } from '@play-money/finance/components/CurrencyDisplay'
import { formatDistanceToNowShort } from '@play-money/ui'
import { UserAvatar } from '@play-money/ui/UserAvatar'
import { DataTable } from '@play-money/ui/data-table'
import { UserLink } from '@play-money/users/components/UserLink'
import { calculateBalanceChanges, findBalanceChange } from '../lib/helpers'
import { TransactionWithEntries } from '../types'

export const columns: Array<ColumnDef<TransactionWithEntries>> = [
  {
    accessorKey: 'initiator',
    header: 'Transaction',
    meta: {
      headerClassName: 'flex-1',
    },
    cell: ({ row }) => {
      const initiator = row.getValue('initiator') as User

      const balanceChanges = calculateBalanceChanges(row.original)
      const primaryChange = findBalanceChange({
        balanceChanges,
        accountId: initiator.primaryAccountId,
        assetType: 'CURRENCY',
        assetId: 'PRIMARY',
      })

      return (
        <div className="flex flex-wrap items-center gap-x-2">
          {initiator ? (
            <>
              <UserAvatar user={initiator} size="sm" />
              <UserLink hideUsername user={initiator} />
            </>
          ) : null}{' '}
          added{' '}
          <span className="font-semibold">
            <CurrencyDisplay value={Math.abs(primaryChange?.change ?? 0)} isShort /> liquidity
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    meta: {
      headerClassName: 'w-10',
    },
    cell: ({ row }) => {
      return (
        <time className="text-sm text-muted-foreground md:ml-auto" dateTime={row.getValue('createdAt')}>
          {formatDistanceToNowShort(row.getValue('createdAt'))}
        </time>
      )
    },
  },
]

export function LiquidityTable({ data, totalPages }: { data: Array<TransactionWithEntries>; totalPages: number }) {
  return <DataTable data={data} columns={columns} totalPages={totalPages} showViewOptions={false} />
}
