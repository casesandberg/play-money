'use client'

import React, { createContext, useContext, useState } from 'react'
import { UserProfile } from '../lib/sanitizeUser'

interface UserContextType {
  user: UserProfile | null
  setUser: (user: UserProfile | null) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({
  children,
  user: initialUser,
}: {
  children: React.ReactNode
  user: UserProfile | null
}) => {
  const [user, setUser] = useState<UserProfile | null>(initialUser)

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>
}
