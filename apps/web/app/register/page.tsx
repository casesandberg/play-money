import { redirect } from 'next/navigation'
import { RegisterPage } from '@play-money/auth/pages/RegisterPage'

export default function AppRegisterPage() {
  redirect('/login')

  return <RegisterPage />
}
