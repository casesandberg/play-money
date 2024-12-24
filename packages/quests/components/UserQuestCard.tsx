'use client'

import { useUserStats } from '@play-money/api-helpers/client/hooks'
import { useUser } from '@play-money/users/context/UserContext'
import { QuestCard } from './QuestCard'

export function UserQuestCard() {
  const { user } = useUser()
  const { data: statsData } = useUserStats({ userId: user?.id ?? '', skip: !user })
  const data = statsData?.data

  return user && data?.quests.length ? <QuestCard quests={data.quests} /> : null
}
