'use client'

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react'
import { getUserReferral } from '@play-money/api-helpers/client'
import { User } from '@play-money/database'
import { useSearchParam } from '../../ui/src/hooks/useSearchParam'

interface ReferralContextType {
  referringUser: User | null
  isLoading: boolean
}

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000

const ReferralContext = createContext<ReferralContextType | undefined>(undefined)

export const ReferralProvider = ({ children }: { children: ReactNode }) => {
  const [refCode, setRefCode] = useSearchParam('ref')
  const [referringUser, setReferringUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchReferringUser = async () => {
      const code = localStorage.getItem('referralCode')
      const timestamp = parseInt(localStorage.getItem('referralTimestamp') || '0', 10)

      if (code && Date.now() - timestamp < THIRTY_DAYS) {
        setIsLoading(true)
        try {
          const user = await getUserReferral({ code })
          setReferringUser(user)
        } catch (error) {
          console.error('Error fetching referral info:', error)
          // TODO: Only remove if 404, not server error
          // clearReferralCode()
        } finally {
          setIsLoading(false)
        }
      } else {
        clearReferralCode()
      }
    }

    if (refCode) {
      setReferralCode(refCode)
      setRefCode('')
    }

    fetchReferringUser()
  }, [])

  return <ReferralContext.Provider value={{ referringUser, isLoading }}>{children}</ReferralContext.Provider>
}

export const useReferral = (): ReferralContextType => {
  const context = useContext(ReferralContext)
  if (context === undefined) {
    throw new Error('useReferral must be used within a ReferralProvider')
  }
  return context
}

function setReferralCode(code: string) {
  localStorage.setItem('referralCode', code)
  localStorage.setItem('referralTimestamp', Date.now().toString())
}

function clearReferralCode() {
  localStorage.removeItem('referralCode')
  localStorage.removeItem('referralTimestamp')
}
