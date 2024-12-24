'use client'

import { ColumnDef } from '@tanstack/react-table'
import Decimal from 'decimal.js'
import _ from 'lodash'
import Link from 'next/link'
import React from 'react'
import { PageInfo } from '@play-money/api-helpers/types'
import { Market, MarketOption, MarketOptionPosition } from '@play-money/database'
import { CurrencyDisplay } from '@play-money/finance/components/CurrencyDisplay'
import { ExtendedMarketPosition } from '@play-money/markets/types'
import { useSearchParam } from '@play-money/ui'
import { DataTable } from '@play-money/ui/data-table'
import { DataTableColumnHeader } from '@play-money/ui/data-table-column-header'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@play-money/ui/select'

export const columns: Array<ColumnDef<ExtendedMarketPosition>> = [
  {
    accessorKey: 'value',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Value" />,
    meta: {
      // headerClassName: 'w-64',
    },
    cell: ({ row }) => {
      const option = row.original.option
      const quantity = new Decimal(row.original.quantity).toDecimalPlaces(4)

      return (
        <Link href={`/questions/${row.original.market.id}/${row.original.market.slug}`} className="line-clamp-2">
          {quantity.gt(0) ? (
            <>
              <CurrencyDisplay value={Number(row.original.value)} /> {_.truncate(option.name, { length: 40 })}
            </>
          ) : (
            <>Closed</>
          )}
        </Link>
      )
    },
  },
  {
    accessorKey: 'change',
    header: 'Change',
    meta: {
      // headerClassName: 'w-64',
    },
    cell: ({ row }) => {
      const value = new Decimal(row.original.value).toDecimalPlaces(4)
      const cost = new Decimal(row.original.cost).toDecimalPlaces(4)
      const change = value.sub(cost).div(cost).times(100).round().toNumber()
      const changeLabel = `(${change > 0 ? '+' : ''}${change}%)`
      const quantity = new Decimal(row.original.quantity).toDecimalPlaces(4)

      return change && quantity.gt(0) ? (
        <span className={change > 0 ? 'text-lime-500' : 'text-red-400'}>{changeLabel}</span>
      ) : null
    },
  },
  {
    accessorKey: 'market',
    header: 'Market',
    meta: {
      headerClassName: 'pl-3 min-w-56',
    },
    cell: ({ row }) => {
      return (
        <Link
          href={`/questions/${row.original.market.id}/${row.original.market.slug}`}
          className="ml-1 line-clamp-2 visited:text-muted-foreground"
        >
          {row.original.market.question}
        </Link>
      )
    },
  },
]

function UserPositionsStatusSelect({ defaultValue = 'active' }: { defaultValue?: string }) {
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
          <SelectItem value="all">All</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export function UserPositionsTable({ data, pageInfo }: { data: Array<ExtendedMarketPosition>; pageInfo: PageInfo }) {
  return (
    <DataTable
      data={data}
      columns={columns}
      pageInfo={pageInfo}
      controls={
        <div>
          <UserPositionsStatusSelect />
        </div>
      }
    />
  )
}
