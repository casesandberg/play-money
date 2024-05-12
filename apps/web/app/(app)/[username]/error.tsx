'use client'

import { UserNotFoundError } from '@play-money/users/lib/exceptions'
import { useEffect } from 'react'

export default function Error({ error }: { error: Error & { digest?: string; code?: string } }) {
  useEffect(() => {
    console.dir(error) // eslint-disable-line -- Log the error to an error reporting service
  }, [error])

  if (error.message === UserNotFoundError.code) {
    return <h2>User not found</h2>
  }

  return (
    <div>
      <h2>Something went wrong!</h2>
    </div>
  )
}
