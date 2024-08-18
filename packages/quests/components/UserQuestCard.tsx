'use client'

import { useUserStats } from '@play-money/api-helpers/client/hooks'
import { useUser } from '@play-money/users/context/UserContext'
import { QuestCard } from './QuestCard'

export function UserQuestCard() {
  const { user } = useUser()
  const { data } = useUserStats({ userId: user?.id ?? '', skip: !user })

  return user && data?.quests.length ? <QuestCard quests={data.quests} /> : null
}
