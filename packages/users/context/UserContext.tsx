'use client'

import React, { createContext, useContext, useState } from 'react'
import { User } from '@play-money/database'

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children, user: initialUser }: { children: React.ReactNode; user: User | null }) => {
  const [user, setUser] = useState<User | null>(initialUser)

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>
}
