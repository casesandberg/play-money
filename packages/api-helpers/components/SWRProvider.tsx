'use client'

import { SWRConfig } from 'swr'

export const SWRProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SWRConfig
      value={{
        fetcher: (resource, init) =>
          fetch(process.env.NEXT_PUBLIC_API_URL + resource, { ...init, credentials: 'include' }).then((res) =>
            res.json()
          ),
      }}
    >
      {children}
    </SWRConfig>
  )
}
