'use client'

import { format } from 'date-fns'
import { CopyIcon } from 'lucide-react'
import React from 'react'
import { User } from '@play-money/database'
import { UserAvatar } from '@play-money/ui/UserAvatar'
import { Button } from '@play-money/ui/button'
import { Card, CardContent } from '@play-money/ui/card'
import { UserLink } from '@play-money/users/components/UserLink'
import { useUser } from '@play-money/users/context/UserContext'

export function SettingsReferralPage({ referrals }: { referrals: Array<User> }) {
  const { user } = useUser()
  const link = `${process.env.NEXT_PUBLIC_WEB_URL}?ref=${user?.referralCode}`

  return (
    <div className="grid gap-8 ">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Referral Program</h1>
          <p className="mt-2 text-muted-foreground">
            For every person who signs up using your link and completes quests during their first week, you’ll receive
            instant bonuses. As they continue to complete more quests over time, you’ll recieve additional bonuses!
          </p>
          <p className="mt-2 text-muted-foreground">
            There's no limit to the number of people you can refer, so the more you share, the more you can earn!
          </p>
        </div>
        <Card className="bg-muted/50">
          <CardContent className="md:pt-6">
            <h2 className="text-xl font-bold">Your Referral Link</h2>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-lg font-medium">{link}</div>
              <Button
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(link)
                }}
              >
                <CopyIcon className="h-4 w-4" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="md:pt-6">
          <h2 className="text-xl font-bold">Referred Users</h2>
          <div className="mt-4 space-y-4">
            {referrals.length ? (
              referrals.map((referral) => (
                <div className="grid grid-cols-[40px_1fr_1fr] items-center gap-4">
                  <UserAvatar user={referral} />
                  <div>
                    <UserLink user={referral} />
                    <div className="font-medium">John Doe</div>
                    {/* <div className="text-sm text-muted-foreground">john@example.com</div> */}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Signed up on {format(referral.createdAt, 'MMM d, yyyy')}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground">None yet.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
