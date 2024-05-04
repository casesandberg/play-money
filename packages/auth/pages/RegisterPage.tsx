'use client'

import { redirect } from 'next/navigation'
import React from 'react'
import { useSession } from 'next-auth/react'
import { buttonVariants } from '@play-money/ui/button'
import { cn } from '@play-money/ui/utils'
import { RegisterForm } from '../components/RegisterForm'
import Image from 'next/image'
import Link from 'next/link'

export function RegisterPage() {
  const { data: session } = useSession()

  if (session) {
    redirect('/')
  }

  return (
    <div className="w-full h-screen lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <Link
        href="/login"
        className={cn(buttonVariants({ variant: 'ghost' }), 'absolute right-4 top-4 md:right-8 md:top-8')}
      >
        Login
      </Link>

      <div className="hidden lg:block bg-primary">
        {/* <Image
          src="/placeholder.svg"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        /> */}
      </div>

      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-2xl font-bold">Create an account</h1>
            <p className="text-balance text-sm text-muted-foreground">Enter your email below to create your account</p>
          </div>

          <RegisterForm />

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
    </div>
  )
}
