import { RegisterPage } from '@play-money/auth/pages/RegisterPage'
import { redirect } from 'next/navigation'

export default function AppRegisterPage() {
  redirect('/login')

  return <RegisterPage />
}
