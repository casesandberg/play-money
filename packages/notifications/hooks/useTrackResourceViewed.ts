import { useEffect } from 'react'
import { mutate } from 'swr'
import { createMyResourceViewed } from '@play-money/api-helpers/client'
import { MY_NOTIFICATIONS_PATH } from '@play-money/api-helpers/client/hooks'
import { useUser } from '@play-money/users/context/UserContext'

export function useTrackResourceViewed({ resourceId, resourceType }: { resourceId: string; resourceType: string }) {
  const { user } = useUser()

  useEffect(() => {
    const trackView = async () => {
      if (user) {
        try {
          await createMyResourceViewed({
            resourceId,
            resourceType,
          })

          void mutate(MY_NOTIFICATIONS_PATH)
        } catch (error) {
          console.error('Error tracking view:', error)
        }
      }
    }

    trackView()
  }, [user, resourceId])
}
