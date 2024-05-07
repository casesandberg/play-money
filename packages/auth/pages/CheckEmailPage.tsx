'use client'

import React from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@play-money/ui/card'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export function CheckEmailPage() {
  const { data: session } = useSession()

  if (session) {
    redirect('/')
  }
  return (
    <div className="w-full h-screen bg-primary flex flex-col justify-center">
      <Card className="mx-auto max-w-xs flex flex-col items-center justify-center text-center p-6 text-balance">
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
