import Link from 'next/link'
import { LoginForm } from '../components/LoginForm'

export function LoginPage() {
  return (
    <div className="h-screen w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-8 px-4">
          <div className="grid gap-2 text-center">
            <h1 className="text-2xl font-bold">Sign in to Play Money</h1>
          </div>

          <LoginForm />

          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{' '}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
      <div className="hidden bg-primary lg:block"></div>
    </div>
  )
}
