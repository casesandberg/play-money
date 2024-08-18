import { useEffect } from 'react'
import { mutate } from 'swr'
import { createMyResourceViewed } from '@play-money/api-helpers/client'
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

          void mutate('/v1/users/me/notifications')
        } catch (error) {
          console.error('Error tracking view:', error)
        }
      }
    }

    trackView()
  }, [user, resourceId])
}
