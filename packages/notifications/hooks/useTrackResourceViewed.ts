import { useEffect } from 'react'
import { mutate } from 'swr'
import { useUser } from '@play-money/users/context/UserContext'

export function useTrackResourceViewed({ resourceId, resourceType }: { resourceId: string; resourceType: string }) {
  const { user } = useUser()

  useEffect(() => {
    const trackView = async () => {
      if (user) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/me/resource-viewed`, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
              resourceType,
              resourceId,
              timestamp: new Date().toISOString(),
            }),
          })

          if (!response.ok) {
            console.error('Error tracking view:', response.statusText)
          }

          void mutate('/v1/users/me/notifications')
        } catch (error) {
          console.error('Error tracking view:', error)
        }
      }
    }

    trackView()
  }, [user, resourceId])
}
