import { format } from 'date-fns'
import { redirect } from 'next/navigation'
import React from 'react'
import { getUserBalance, getUserStats, getUserUsername } from '@play-money/api-helpers/client'
import { CurrencyDisplay } from '@play-money/finance/components/CurrencyDisplay'
import { formatNumber } from '@play-money/finance/lib/formatCurrency'
import { UserAvatar } from '@play-money/ui/UserAvatar'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@play-money/ui/card'
import { Separator } from '@play-money/ui/separator'
import { UserPlaystyleChart } from './UserPlaystyleChart'

const DiscordIcon = ({ className }: { className: string }) => (
  <svg viewBox="0 -28.5 256 256" version="1.1" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"
      fill="currentColor"
      fillRule="nonzero"
    ></path>
  </svg>
)

const TwitterIcon = ({ className }: { className: string }) => (
  <svg viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M459.186,151.787c0.203,4.501,0.305,9.023,0.305,13.565
c0,138.542-105.461,298.285-298.274,298.285c-59.209,0-114.322-17.357-160.716-47.104c8.212,0.973,16.546,1.47,25.012,1.47
c49.121,0,94.318-16.759,130.209-44.884c-45.887-0.841-84.596-31.154-97.938-72.804c6.408,1.227,12.968,1.886,19.73,1.886
c9.55,0,18.816-1.287,27.617-3.68c-47.955-9.633-84.1-52.001-84.1-102.795c0-0.446,0-0.882,0.011-1.318
c14.133,7.847,30.294,12.562,47.488,13.109c-28.134-18.796-46.637-50.885-46.637-87.262c0-19.212,5.16-37.218,14.193-52.7
c51.707,63.426,128.941,105.156,216.072,109.536c-1.784-7.675-2.718-15.674-2.718-23.896c0-57.891,46.941-104.832,104.832-104.832
c30.173,0,57.404,12.734,76.525,33.102c23.887-4.694,46.313-13.423,66.569-25.438c-7.827,24.485-24.434,45.025-46.089,58.002
c21.209-2.535,41.426-8.171,60.222-16.505C497.448,118.542,479.666,137.004,459.186,151.787z"
      fill="currentColor"
    ></path>
  </svg>
)

function getOrdersOfMagnitude(num: number): number {
  if (num < 1) {
    return 1
  }

  return Math.floor(Math.log10(num / 1)) + 1
}

export async function UserProfileLayout({
  params: { username },
  children,
}: {
  params: { username: string }
  children: React.ReactNode
}) {
  try {
    const { data: profile } = await getUserUsername({ username })
    const { data: stats } = await getUserStats({ userId: profile.id })
    const {
      data: { balance },
    } = await getUserBalance({ userId: profile.id })

    const quester =
      balance.subtotals['DAILY_TRADE_BONUS'] +
      balance.subtotals['DAILY_MARKET_BONUS'] +
      balance.subtotals['DAILY_COMMENT_BONUS'] +
      balance.subtotals['DAILY_LIQUIDITY_BONUS']
    const creator = balance.subtotals['CREATOR_TRADER_BONUS']
    const trader = Math.abs(balance.subtotals['TRADE_BUY'])
    const promoter = Math.abs(balance.subtotals['LIQUIDITY_DEPOSIT'])
    const referrer = balance.subtotals['REFERRER_BONUS']

    const playstyleData = [
      { subject: 'Quester', value: getOrdersOfMagnitude(quester) / 4, color: '#a0d8e7' },
      { subject: 'Creator', value: getOrdersOfMagnitude(creator) / 4, color: '#ffc638' },
      { subject: 'Trader', value: getOrdersOfMagnitude(trader) / 4, color: '#00cdb1' },
      { subject: 'Promoter', value: getOrdersOfMagnitude(promoter) / 4, color: '#8247ff' },
      { subject: 'Referrer', value: getOrdersOfMagnitude(referrer) / 4, color: '#2563eb' },
    ]

    return (
      <main className="mx-auto flex flex-1 flex-col items-start gap-6 md:flex-row">
        <div className="w-full space-y-4 md:w-80">
          <Card>
            <CardHeader className="flex flex-row items-start gap-4 bg-muted/50">
              <UserAvatar user={profile} size="lg" />
              <div>
                <CardTitle className="text-lg">{profile.displayName}</CardTitle>
                <CardDescription>@{profile.username}</CardDescription>
              </div>
              {/* <div className="ml-auto flex items-center gap-1">
            <EditOrFollowUserButton userId={profile.id} />
          </div> */}
            </CardHeader>
            <CardContent className="pt-3 text-sm md:pt-6">
              <div className="grid gap-3">
                {profile.bio ? <div>{profile.bio}</div> : null}
                {profile.twitterHandle || profile.discordHandle || profile.website ? (
                  <div className="flex min-w-0 flex-row gap-4">
                    {profile.twitterHandle ? (
                      <a
                        href={`https://twitter.com/${profile.twitterHandle}`}
                        target="_blank"
                        className="flex min-w-0 items-center gap-2 text-muted-foreground hover:text-foreground hover:underline"
                      >
                        <TwitterIcon className="h-4 w-4" />
                        <span className="truncate">{profile.twitterHandle}</span>
                      </a>
                    ) : null}

                    {profile.discordHandle ? (
                      <a
                        href={`https://discordapp.com/users/${profile.discordHandle}`}
                        target="_blank"
                        className="flex min-w-0 items-center gap-2 text-muted-foreground hover:text-foreground hover:underline"
                      >
                        <DiscordIcon className="h-4 w-4" />
                        <span className="truncate">{profile.discordHandle}</span>
                      </a>
                    ) : null}

                    {profile.website ? (
                      <a
                        href={profile.website}
                        target="_blank"
                        className="flex min-w-0 items-center gap-2 text-muted-foreground hover:text-foreground hover:underline"
                      >
                        <DiscordIcon className="h-4 w-4" />
                        <span className="truncate">{profile.website}</span>
                      </a>
                    ) : null}
                  </div>
                ) : null}
                {/* <div className="flex flex-row gap-4">
              <Link
                href={`/${profile.username}/followers`}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground hover:underline"
              >
                <span className="font-semibold text-foreground">{profile.followingCount || 0}</span>
                <span>Following</span>
              </Link>
              <Link
                href={`/${profile.username}/followers`}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground hover:underline"
              >
                <span className="font-semibold text-foreground">{profile.followersCount || 0}</span>
                <span>Followers</span>
              </Link>
            </div> */}
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="font-semibold">
                    <CurrencyDisplay value={stats.netWorth + stats.otherIncome} isShort />
                  </div>
                  <div className="text-muted-foreground">Net worth</div>
                </div>
                <div className="text-center">
                  <div className="font-mono font-semibold">{formatNumber(stats.tradingVolume)}</div>
                  <div className="text-muted-foreground">Trading volume</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{stats.totalMarkets}</div>
                  <div className="text-muted-foreground">Total markets</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">
                    {stats.lastTradeAt ? (
                      <time dateTime={stats.lastTradeAt.toString()}>{format(stats.lastTradeAt, 'MMM d, yyyy')}</time>
                    ) : (
                      '-'
                    )}
                  </div>
                  <div className="text-muted-foreground">Last traded</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-row items-center border-t bg-muted/50 py-3 md:py-3">
              <div className="text-xs text-muted-foreground">
                Joined <time dateTime={profile.createdAt.toString()}>{format(profile.createdAt, 'MMM d, yyyy')}</time> —{' '}
                {stats.activeDayCount} day{stats.activeDayCount > 1 ? 's' : ''} active
              </div>
            </CardFooter>
          </Card>

          <Card className="relative p-4">
            <div className="absolute z-10 text-lg font-semibold text-muted-foreground">Playstyle</div>
            <UserPlaystyleChart data={playstyleData} />
            <div className="flex flex-wrap justify-center gap-x-3 border-t pt-1">
              {playstyleData.map(({ subject, value, color }) => (
                <div key={subject} className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-md" style={{ backgroundColor: color }} />
                  <div className="font-mono text-xs text-muted-foreground">{subject}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="w-full flex-1">{children}</div>
      </main>
    )
  } catch (error) {
    redirect('/')
  }
}
