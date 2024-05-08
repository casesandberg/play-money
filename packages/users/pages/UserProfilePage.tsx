import React from 'react'
import { UserNotFoundError } from '../lib/exceptions'

// TODO: Generate this from OpenAPI schema
async function getUserProfile({ username }: { username: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/username/${username}`)
  if (!res.ok) {
    if (res.status === 404) {
      // TODO: Figure out how to pass around errors for next error boundaries
      // if (errorResponse?.error?.code === UserNotFoundError.code) {
      // throw new UserNotFoundError(errorResponse.error.message)
      throw new Error(UserNotFoundError.code)
    }

    throw new Error('There was an error fetching data')
  }

  return res.json()
}

export async function UserProfilePage({ username }: { username: string }) {
  const data = await getUserProfile({ username })

  return <div>User Profile: {JSON.stringify(data, null, 2)}</div>
}
