'use client'

import { flexRender, functionalUpdate, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import type {
  ColumnDef,
  VisibilityState,
  PaginationState,
  RowData,
  SortingState,
  Updater,
  PaginationOptions,
  SortingOptions,
  VisibilityOptions,
} from '@tanstack/react-table'
import React, { useState, Fragment } from 'react'
import { DataTablePagination } from '@play-money/ui/data-table-pagination'
import { DataTableViewOptions } from '@play-money/ui/data-table-view-options'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@play-money/ui/table'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useSearchParam } from '../../hooks/useSearchParam'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Extended interfaces need to match the same type signature of the original
  interface ColumnMeta<TData extends RowData, TValue> {
    headerClassName?: string
  }
}

interface DataTableProps<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue>>
  data: Array<TData>
  totalPages: number
  controls?: React.ReactNode
  showViewOptions?: boolean
}

function useURLSorting(): SortingOptions<unknown> & { sorting: SortingState } {
  const [sorting, setSorting] = useSearchParam('sort')

  let sortingState: SortingState = []
  if (sorting) {
    const [id, direction] = sorting.split('-')
    sortingState = [
      {
        id,
        desc: direction === 'desc',
      },
    ]
  }

  return {
    sorting: sortingState,
    onSortingChange: (changeFn: Updater<SortingState>) => {
      const results = functionalUpdate(changeFn, sortingState)
      setSorting(results.map(({ id, desc }) => `${id}-${desc ? 'desc' : 'asc'}`).join(','))
    },
    manualSorting: true,
  }
}

function useURLPagination({ pageCount }: { pageCount: number }): PaginationOptions & { pagination: PaginationState } {
  const [pageSize] = useSearchParam('pageSize')
  const [page] = useSearchParam('page')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: page ? parseInt(page) - 1 : 0,
    pageSize: pageSize ? parseInt(pageSize) : 50,
  })

  return { pagination, onPaginationChange: setPagination, manualPagination: true, pageCount }
}

function useLocalStorageColumnVisibility(): VisibilityOptions & { columnVisibility: VisibilityState } {
  const [columnVisibility, setColumnVisibility] = useLocalStorage<VisibilityState>('data-table-visibility', {
    commentCount: false,
    uniqueTradersCount: false,
    closeDate: false,
  })

  return {
    columnVisibility,
    onColumnVisibilityChange: setColumnVisibility,
  }
}

export function DataTable<TData, TValue>({
  data,
  columns,
  totalPages,
  controls = <></>,
  showViewOptions = true,
}: DataTableProps<TData, TValue>) {
  const { sorting, ...sortingOptions } = useURLSorting()
  const { pagination, ...paginationOptions } = useURLPagination({ pageCount: totalPages })
  const { columnVisibility, ...columnVisibilityOptions } = useLocalStorageColumnVisibility()

  const table = useReactTable({
    data,
    columns,
    state: { columnVisibility, pagination, sorting },
    getCoreRowModel: getCoreRowModel(),
    ...paginationOptions,
    ...sortingOptions,
    ...columnVisibilityOptions,
  })

  return (
    <div className="flex w-full flex-col gap-4">
      {showViewOptions ? (
        <div className="flex justify-between">
          {controls}
          <DataTableViewOptions table={table} />
        </div>
      ) : null}
      <div className="rounded-md border font-mono text-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className={header.column.columnDef.meta?.headerClassName} key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow data-state={row.getIsSelected() && 'selected'} key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="h-24 text-center" colSpan={columns.length}>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
