'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error) // eslint-disable-line no-console -- Client-side error log
  }, [error])

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button
        onClick={() => {
          reset()
        }}
        type="button"
      >
        Try again
      </button>
    </div>
  )
}
