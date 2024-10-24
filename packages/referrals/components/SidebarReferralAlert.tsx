'use client'

import { ArrowRight } from 'lucide-react'
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
import { useReferral } from './ReferralContext'

const BONUS =
  DAILY_TRADE_BONUS_PRIMARY * 7 +
  DAILY_MARKET_BONUS_PRIMARY * 7 +
  DAILY_COMMENT_BONUS_PRIMARY * 7 +
  DAILY_LIQUIDITY_BONUS_PRIMARY * 7

export function SidebarReferralAlert() {
  const router = useRouter()
  const { mouseX, mouseY, handleMouseMove, classNames } = useSpotlight()
  const { referringUser } = useReferral()

  return referringUser ? (
    <Alert
      className={cn('flex gap-4 border-blue-600 bg-blue-50 dark:bg-blue-600/20', classNames)}
      onMouseMove={handleMouseMove}
    >
      <UserAvatar user={referringUser} />
      {/* <DiamondPlus className="h-4 w-4 stroke-blue-600" /> */}
      <div className="flex-1">
        <AlertTitle>
          <UserLink user={referringUser} hideUsername /> invited you!
        </AlertTitle>

        <AlertDescription className="text-muted-foreground">
          Earn up to <CurrencyDisplay value={BONUS} isShort className="underline underline-offset-2" /> for you and{' '}
          <UserLink user={referringUser} hideUsername /> when you sign up today.
        </AlertDescription>
        <AlertTitle className="mb-0 mt-1">
          <Button variant="link" className="h-auto p-0 text-blue-600 underline" onClick={() => router.push('/login')}>
            Sign up
            <ArrowRight className="h-4 w-4" />
          </Button>
        </AlertTitle>
      </div>

      <Spotlight mouseX={mouseX} mouseY={mouseY} color="blue" />
    </Alert>
  ) : null
}
