'use client'

import type { Table } from '@tanstack/react-table'
import { ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import useUpdateSearchParams from '../../hooks/useUpdateSearchParams'
import { Button } from './button'
import type { PageInfo } from './data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export function DataTablePagination<TData>({
  table,
  pageInfo,
}: DataTablePaginationProps<TData> & { pageInfo: PageInfo }) {
  const updateSearchParams = useUpdateSearchParams()
  const router = useRouter()

  const updatePageSearchParams = (values: Record<string, unknown>) => {
    const newSearchParams = updateSearchParams(values)
    router.replace(`?${newSearchParams}`, { scroll: false })
  }

  return (
    <div className="flex items-center justify-end space-x-4 md:space-x-6 lg:space-x-8">
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium">Rows per page</p>
        <Select
          onValueChange={(value) => {
            table.setPageSize(Number(value))
            updatePageSearchParams({ limit: value, cursor: '' })
          }}
          value={`${table.getState().pagination.pageSize}`}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[5, 25, 50, 100].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* <div className="flex items-center justify-center text-sm font-medium">
        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
      </div> */}
      <div className="flex items-center space-x-2">
        {/* <Button
          className="h-8 w-8 p-0"
          disabled={!table.getCanPreviousPage()}
          onClick={() => {
            table.previousPage()
            updatePageSearchParams({ page: table.getState().pagination.pageIndex + 1 - 1 })
          }}
          variant="outline"
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft className="h-4 w-4" />
        </Button> */}
        <Button
          className="h-8"
          disabled={!pageInfo.hasNextPage}
          onClick={() => {
            table.nextPage()
            updatePageSearchParams({ cursor: pageInfo.endCursor })
          }}
          size="sm"
          variant="outline"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
