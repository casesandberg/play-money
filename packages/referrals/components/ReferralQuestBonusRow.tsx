import React from 'react'
import { Badge } from '@play-money/ui/badge'
import { InfoTooltip } from '@play-money/ui/info-tooltip'
import { useUser } from '@play-money/users/context/UserContext'
import { isNewlyReferredUser } from '../lib/helpers'

export function ReferralQuestBonusRow() {
  const { user } = useUser()

  return user && isNewlyReferredUser(user) ? (
    <div className="mt-2 flex items-center justify-between border-t pt-4 ">
      <p className="line-clamp-1 text-sm font-medium">
        Plus <Badge variant="blue">x2</Badge> referral bonus
      </p>

      <InfoTooltip description="Recieve 2 times daily quest bonuses for the first week after being referred" />
    </div>
  ) : null
}
