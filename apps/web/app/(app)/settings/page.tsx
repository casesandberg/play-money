import { auth } from '@play-money/auth'
import { SettingsProfileForm } from '@play-money/users/components/SettingsProfileForm'
import { redirect } from 'next/navigation'

export default async function AppSettingsPage() {
  const session = await auth()

  if (!session) {
    redirect('/login?redirect=/settings')
  }

  return (
    <div>
      <SettingsProfileForm />
    </div>
  )
}
