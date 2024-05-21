'use client'

import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import type { KeyboardShortcutCommand } from '@tiptap/react'
import { EditorContent, Extension, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect, useState } from 'react'
import { cn } from '../../lib/utils'

function Editor({
  value,
  disabled,
  className,
  inputClassName,
  placeholder,
  focusOnRender,
  shortcuts,
  onBlur,
  onChange,
}: {
  value?: string
  disabled?: boolean
  className?: string
  inputClassName?: string
  placeholder?: string
  focusOnRender?: boolean
  shortcuts?: Record<string, KeyboardShortcutCommand>
  onBlur?: () => void
  onChange?: (value: string) => void
}) {
  const [isEditorRendered, setIsEditorRendered] = useState(false)
  const editor = useEditor({
    content: value,
    editable: !disabled,
    editorProps: {
      attributes: {
        class: cn(
          'prose w-full flex-1 rounded-md bg-transparent border-b-0 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 overflow-auto',
          !disabled && 'p-4',
          inputClassName
        ),
      },
    },
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Extension.create({
        name: 'customShortcuts',
        addKeyboardShortcuts() {
          return { ...shortcuts }
        },
      }),
      Link.configure({
        HTMLAttributes: {
          class: 'text-primary',
        },
      }),
    ],
    onCreate() {
      setIsEditorRendered(true)
    },
    onUpdate({ editor: innerEditor }) {
      onChange?.(innerEditor.getHTML())
    },
    onBlur() {
      onBlur?.()
    },
  })

  useEffect(
    function handleResetEdgeCase() {
      // Fix for react-hook-form resetting the value to '<p></p>' when the form is reset
      if (editor && value === '<p></p>' && value !== editor.getHTML()) {
        editor.commands.setContent(value)
      }
    },
    [editor, value]
  )

  useEffect(
    function focusWhenFirstRendered() {
      if (isEditorRendered && focusOnRender) {
        editor?.commands.focus('end')
      }
    },
    [isEditorRendered] // eslint-disable-line react-hooks/exhaustive-deps -- We only want to run this effect once
  )

  return <EditorContent className={cn('flex flex-col', className)} editor={editor} />
}

export { Editor }
