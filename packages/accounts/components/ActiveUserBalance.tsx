'use client'

import useSWR from 'swr'
import { CurrencyDisplay } from '@play-money/currencies/components/CurrencyDisplay'
import { useUser } from '@play-money/users/context/UserContext'

export function ActiveUserBalance() {
  const { user } = useUser()
  const { data } = useSWR(user ? '/v1/users/me/balance' : null)

  return user ? <CurrencyDisplay currencyCode="PRIMARY" value={data?.balance ?? 0} /> : null
}
