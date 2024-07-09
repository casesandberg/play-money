'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export function useSearchParam(key: string, method: 'replace' | 'push' = 'push') {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const onChange = useCallback(
    (newValue: string) => {
      const currentParams = new URLSearchParams(Array.from(searchParams.entries()))

      if (!newValue) {
        currentParams.delete(key)
      } else {
        currentParams.set(key, newValue)
      }

      const search = currentParams.toString()
      const query = search ? `?${search}` : ''

      router[method](`${pathname}${query}`)
    },
    [key, router, pathname, searchParams, method]
  )

  return [searchParams.get(key), onChange] as const
}
