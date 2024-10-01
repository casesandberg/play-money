'use client'

import { LoaderCircleIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { useUser } from '@play-money/users/context/UserContext'

export default function AppSetupPage() {
  const router = useRouter()
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      router.push(`/${user.username}`)
    } else {
      router.push('/login?redirect=/me')
    }
  }, [])

  return (
    <div className="flex w-full justify-center self-center justify-self-center">
      <LoaderCircleIcon className="animate-spin" />
    </div>
  )
}
