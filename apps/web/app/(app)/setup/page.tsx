'use client'

import { LoaderCircleIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { updateMe } from '@play-money/api-helpers/client'
import { useReferral } from '@play-money/referrals/components/ReferralContext'
import { toast } from '@play-money/ui/use-toast'
import { useUser } from '@play-money/users/context/UserContext'

export default function AppSetupPage() {
  const router = useRouter()
  const { user, setUser } = useUser()
  const { referringUser, isLoading, clear } = useReferral()

  useEffect(() => {
    async function main() {
      if (isLoading) {
        return
      }

      if (user && !user.referredBy && referringUser?.id) {
        try {
          const { data: updatedUser } = await updateMe({ referredBy: referringUser.id })

          setUser(updatedUser)
          clear()
        } catch (error) {
          toast({
            title: 'There was an error adding your referrer',
            description: (error as Error).message,
          })
        } finally {
          router.push('/')
        }
      } else {
        router.push('/')
      }
    }

    void main()
  }, [isLoading])

  return (
    <div className="flex w-full justify-center self-center justify-self-center">
      <LoaderCircleIcon className="animate-spin" />
    </div>
  )
}
