'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import React from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@play-money/ui/card'

export function CheckEmailPage() {
  const { data: session } = useSession()

  if (session) {
    redirect('/')
  }
  return (
    <div className="flex h-screen w-full flex-col justify-center bg-primary">
      <Card className="mx-auto flex max-w-xs flex-col items-center justify-center text-balance p-6 text-center">
        <CardHeader className="space-y-8">
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We've sent a sign-in link to your email address. Check your inbox and click the link to sign in.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
