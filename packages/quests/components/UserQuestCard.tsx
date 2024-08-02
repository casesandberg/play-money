'use client'

import useSWR from 'swr'
import { useUser } from '@play-money/users/context/UserContext'
import { QuestCard, Quest } from './QuestCard'

export function UserQuestCard() {
  const { user } = useUser()
  const { data } = useSWR<{ quests: Array<Quest> }>(user ? `/v1/users/${user.id}/stats` : null)

  return user && data?.quests.length ? <QuestCard quests={data.quests} /> : null
}
