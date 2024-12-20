import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import React from 'react'
import { createMyApiKey, getMyApiKeys } from '@play-money/api-helpers/client'
import { auth } from '@play-money/auth'
import { SettingsApiPage } from '@play-money/referrals/components/SettingsApiPage'

export default async function AppSettingsPage() {
  const session = await auth()

  if (!session) {
    redirect('/login?redirect=/settings/api')
  }

  const { keys } = await getMyApiKeys()

  async function handleCreateKey() {
    'use server'
    await createMyApiKey({ name: 'DEFAULT' })
    revalidatePath('/settings/api')
  }

  return <SettingsApiPage keys={keys} onCreateKey={handleCreateKey} />
}
