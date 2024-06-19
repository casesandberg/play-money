'use client'

import useSWR from 'swr'
import { CurrencyDisplay } from '@play-money/currencies/components/CurrencyDisplay'

export function ActiveUserBalance() {
  const { data } = useSWR('/v1/users/me/balance')

  return <CurrencyDisplay currencyCode="PRIMARY" value={data?.balance ?? 0} />
}
