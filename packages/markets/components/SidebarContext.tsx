import React, { createContext, useState, useContext, ReactNode } from 'react'

// Define the context type
interface SidebarContextType {
  effect: boolean
  triggerEffect: () => void
  resetEffect: () => void
}

// Create the context with a default value
const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

// Provider component
interface SidebarProviderProps {
  children: ReactNode
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [effect, setEffect] = useState(false)

  const triggerEffect = () => {
    setEffect(true)
  }

  const resetEffect = () => {
    setEffect(false)
  }

  return <SidebarContext.Provider value={{ effect, triggerEffect, resetEffect }}>{children}</SidebarContext.Provider>
}

// Custom hook to use the context
export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
