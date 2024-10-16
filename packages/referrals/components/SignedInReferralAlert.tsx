'use client'

import { ArrowRight, UserPlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { CurrencyDisplay } from '@play-money/finance/components/CurrencyDisplay'
import {
  DAILY_COMMENT_BONUS_PRIMARY,
  DAILY_LIQUIDITY_BONUS_PRIMARY,
  DAILY_MARKET_BONUS_PRIMARY,
  DAILY_TRADE_BONUS_PRIMARY,
} from '@play-money/finance/economy'
import { Spotlight, useSpotlight } from '@play-money/ui/Spotlight'
import { UserAvatar } from '@play-money/ui/UserAvatar'
import { Alert, AlertDescription, AlertTitle } from '@play-money/ui/alert'
import { Button } from '@play-money/ui/button'
import { cn } from '@play-money/ui/utils'
import { UserLink } from '@play-money/users/components/UserLink'
import { useUser } from '@play-money/users/context/UserContext'
import { useReferral } from './ReferralContext'

const BONUS =
  DAILY_TRADE_BONUS_PRIMARY * 7 +
  DAILY_MARKET_BONUS_PRIMARY * 7 +
  DAILY_COMMENT_BONUS_PRIMARY * 7 +
  DAILY_LIQUIDITY_BONUS_PRIMARY * 7

export function SignedInReferralAlert() {
  const router = useRouter()
  const { user } = useUser()
  const { mouseX, mouseY, handleMouseMove, classNames } = useSpotlight()

  return user ? (
    <Alert
      className={cn(
        'flex cursor-pointer items-center gap-4 border-blue-300 bg-blue-50 pb-3 dark:bg-blue-600/20',
        classNames
      )}
      onMouseMove={handleMouseMove}
      onClick={() => router.push('/settings/referrals')}
    >
      {/* <UserAvatar user={referringUser} /> */}
      <UserPlusIcon className="h-4 w-4 stroke-blue-500" />
      <AlertDescription className="text-blue-500">
        Refer a new user, earn up to <CurrencyDisplay value={BONUS} isShort className="underline underline-offset-2" />{' '}
        <ArrowRight className="inline-block h-4 w-4" />
      </AlertDescription>

      <Spotlight mouseX={mouseX} mouseY={mouseY} color="blue" />
    </Alert>
  ) : null
}
