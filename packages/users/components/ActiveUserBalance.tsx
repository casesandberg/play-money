'use client'

import { useMyBalance } from '@play-money/api-helpers/client/hooks'
import { CurrencyDisplay } from '@play-money/finance/components/CurrencyDisplay'
import { useUser } from '@play-money/users/context/UserContext'

export function ActiveUserBalance({ initialBalance }: { initialBalance?: number }) {
  const { user } = useUser()
  const { data: balanceData } = useMyBalance({ skip: !user })
  const data = balanceData?.data

  return user ? <CurrencyDisplay value={data?.balance ?? initialBalance ?? 0} /> : null
}
