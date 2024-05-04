'use client'

import { useSession, signIn, signOut } from 'next-auth/react'

export default function Page(): JSX.Element {
  const { data: session } = useSession()
  if (session) {
    return (
      <p>
        Signed in as {session.user?.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </p>
    )
  }

  return (
    <p>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </p>
  )
}
