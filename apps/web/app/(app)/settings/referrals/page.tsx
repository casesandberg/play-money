import { redirect } from 'next/navigation'
import React from 'react'
import { getMyReferrals } from '@play-money/api-helpers/client'
import { auth } from '@play-money/auth'
import { SettingsReferralPage } from '@play-money/referrals/components/SettingsReferralPage'

export default async function AppSettingsPage() {
  const session = await auth()

  if (!session) {
    redirect('/login?redirect=/settings/referrals')
  }

  const { data: referrals } = await getMyReferrals()

  return <SettingsReferralPage referrals={referrals} />
}
