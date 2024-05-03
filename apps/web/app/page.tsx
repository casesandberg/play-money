'use client'

import { signIn } from 'next-auth/react'

export default function Page(): JSX.Element {
  return (
    <main className="flex flex-col items-center justify-between min-h-screen p-24">
      <button onClick={() => signIn()}>Sign in</button>
    </main>
  )
}
