'use client'

import type { Extensions } from '@tiptap/react'
import React, { createContext, useContext } from 'react'

type EditorExtensionsContextType = {
  extensions: Extensions
}

const EditorExtensionsContext = createContext<EditorExtensionsContextType | undefined>(undefined)

export function EditorExtensionsProvider({
  children,
  extensions,
}: {
  children: React.ReactNode
  extensions: Extensions
}) {
  return <EditorExtensionsContext.Provider value={{ extensions }}>{children}</EditorExtensionsContext.Provider>
}

export const useEditorExtensions = () => {
  return useContext(EditorExtensionsContext)
}
