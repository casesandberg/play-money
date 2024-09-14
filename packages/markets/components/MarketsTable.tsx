'use client'

import { ColumnDef, RowData } from '@tanstack/react-table'
import { MinusIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { User } from '@play-money/database'
import { CurrencyDisplay } from '@play-money/finance/components/CurrencyDisplay'
import { formatDistanceToNowShort } from '@play-money/ui'
import { useSearchParam } from '@play-money/ui'
import { UserAvatar } from '@play-money/ui/UserAvatar'
import { DataTable } from '@play-money/ui/data-table'
import { DataTableColumnHeader } from '@play-money/ui/data-table-column-header'
import { Progress } from '@play-money/ui/progress'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@play-money/ui/select'
import { ExtendedMarket } from '../types'
import { MarketProbabilityDetail } from './MarketProbabilityDetail'

export const columns: Array<ColumnDef<ExtendedMarket>> = [
  {
    accessorKey: 'question',
    header: 'Question',
    enableHiding: false,
    meta: {
      headerClassName: 'pl-3 min-w-56',
    },
    cell: ({ row }) => {
      return (
        <Link
          href={`/questions/${row.original.id}/${row.original.slug}`}
          className="ml-1 line-clamp-2 visited:text-muted-foreground"
        >
          {row.getValue('question')}
        </Link>
      )
    },
  },
  {
    accessorKey: 'options',
    header: 'Probability',
    meta: {
      headerClassName: 'w-64',
    },
    cell: ({ row }) => {
      const options = row.original.options
      const marketResolution = row.original.marketResolution

      return (
        <Link href={`/questions/${row.original.id}/${row.original.slug}`}>
          {marketResolution ? (
            <div className="text-muted-foreground">
              <span className="font-semibold">Resolved</span> {marketResolution.resolution.name}
            </div>
          ) : (
            <MarketProbabilityDetail options={options} />
          )}
        </Link>
      )
    },
  },
  {
    accessorKey: 'commentCount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Comments" />,
    cell: ({ row }) => {
      const value = row.getValue<number>('commentCount')
      if (value) {
        return <div className="text-muted-foreground">{value}</div>
      }
      return <MinusIcon className="h-4 w-4 text-muted-foreground/50" />
    },
  },
  {
    accessorKey: 'uniqueTradersCount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Traders" />,
    cell: ({ row }) => {
      const value = row.getValue<number>('uniqueTradersCount')
      if (value) {
        return <div className="text-muted-foreground">{value}</div>
      }
      return <MinusIcon className="h-4 w-4 text-muted-foreground/50" />
    },
  },
  {
    accessorKey: 'liquidityCount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Liquidity" />,
    meta: {
      headerClassName: 'w-32',
    },
    cell: ({ row }) => {
      return <CurrencyDisplay value={row.getValue('liquidityCount')} />
    },
  },
  {
    accessorKey: 'closeDate',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Closes" />,
    cell: ({ row }) => {
      const value = row.getValue<Date>('closeDate')
      if (value) {
        return <div className="text-muted-foreground">{formatDistanceToNowShort(value)}</div>
      }

      return <MinusIcon className="h-4 w-4 text-muted-foreground/50" />
    },
  },
  {
    accessorKey: 'user',
    header: 'User ',
    meta: {
      headerClassName: 'w-14',
    },
    cell: ({ row }) => {
      const user = row.getValue('user') as User
      return (
        <Link href={`/${user.username}`}>
          <UserAvatar user={user} size="sm" />
        </Link>
      )
    },
  },
]

function MarketTableStatusSelect({ defaultValue = 'active' }: { defaultValue?: string }) {
  const [status, setStatus] = useSearchParam('status')

  return (
    <Select
      value={status || defaultValue}
      onValueChange={(value) => {
        setStatus(value === defaultValue ? undefined : value)
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Status</SelectLabel>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export function MarketsTable({ data, totalPages }: { data: Array<ExtendedMarket>; totalPages: number }) {
  return (
    <DataTable
      data={data}
      columns={columns}
      totalPages={totalPages}
      controls={
        <div>
          <MarketTableStatusSelect />
        </div>
      }
    />
  )
}
