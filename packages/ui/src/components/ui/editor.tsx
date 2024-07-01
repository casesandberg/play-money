'use client'

import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import type { KeyboardShortcutCommand } from '@tiptap/react'
import { EditorContent, Extension, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { ChevronDown, ChevronUp } from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'
import { cn } from '../../lib/utils'
import { Button } from './button'

export type EditorProps = {
  value?: string
  disabled?: boolean
  className?: string
  inputClassName?: string
  placeholder?: string
  focusOnRender?: boolean
  shortcuts?: Record<string, KeyboardShortcutCommand>
  onBlur?: () => void
  onChange?: (value: string) => void
  onRendered?: () => void
}

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
  onRendered,
}: EditorProps) {
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
      onRendered?.()
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

function ReadMoreEditor({
  value,
  maxLines,
  className,
  editorProps,
}: {
  value: string
  maxLines: number
  className?: string
  editorProps?: Partial<EditorProps>
}) {
  const [isRendered, setIsRendered] = useState(false)
  const [canOverflow, setCanOverflow] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkOverflow = () => {
      const element = editorRef.current
      if (element) {
        const lineHeight = parseInt(window.getComputedStyle(element).lineHeight, 10)
        const maxHeight = lineHeight * maxLines
        setCanOverflow(element.scrollHeight > maxHeight)
      }
    }

    checkOverflow()
    window.addEventListener('resize', checkOverflow)

    return () => {
      window.removeEventListener('resize', checkOverflow)
    }
  }, [isRendered, value, maxLines])

  return (
    <div className={className}>
      <div
        ref={editorRef}
        style={{
          maxHeight: isOpen ? 'unset' : `${maxLines * 1.5}em`,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Editor
          disabled
          onRendered={() => {
            setIsRendered(true)
          }}
          value={value}
          {...editorProps}
        />

        {canOverflow ? (
          <Button
            className="absolute -bottom-3 right-0 ml-auto bg-background"
            onClick={() => {
              setIsOpen(!isOpen)
            }}
            size="sm"
            variant="link"
          >
            {isOpen ? 'Read less' : 'Read more'}
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export { Editor, ReadMoreEditor }
