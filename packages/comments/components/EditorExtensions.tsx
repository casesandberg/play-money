'use client'

import type { MentionNodeAttrs } from '@tiptap/extension-mention'
import Mention from '@tiptap/extension-mention'
import type { NodeViewProps } from '@tiptap/react'
import { mergeAttributes, NodeViewWrapper, ReactNodeViewRenderer, ReactRenderer } from '@tiptap/react'
import type { SuggestionOptions } from '@tiptap/suggestion'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import type { Instance } from 'tippy.js'
import tippy from 'tippy.js'
import { getSearch, getUser } from '@play-money/api-helpers/client'
import type { User } from '@play-money/database'
import { EditorExtensionsProvider } from '@play-money/ui'
import { UserAvatar } from '@play-money/ui/UserAvatar'
import type { MentionListRef } from './MentionList'
import { MentionList } from './MentionList'

// Mention example from TipTap: https://tiptap.dev/docs/editor/extensions/nodes/mention
// TODO: Figure out how to use our internal popover for the mention list instead of tippy.js

const suggestion: Omit<SuggestionOptions<unknown, MentionNodeAttrs>, 'editor'> = {
  items: async ({ query }) => {
    const { data } = await getSearch({ query })

    return data.users
  },

  render: () => {
    let component: ReactRenderer<MentionListRef>
    let popup: Instance

    return {
      onStart: (props) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) {
          return
        }

        popup = tippy(document.body, {
          getReferenceClientRect: props.clientRect as () => DOMRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        })
      },

      onUpdate(props) {
        component.updateProps(props)

        if (!props.clientRect) {
          return
        }

        popup.setProps({
          getReferenceClientRect: props.clientRect as () => DOMRect,
        })
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          popup.hide()

          return true
        }

        return component.ref?.onKeyDown(props) ?? false
      },

      onExit() {
        popup.destroy()
        component.destroy()
      },
    }
  },
}

export function MentionChip(props: NodeViewProps) {
  const [user, setUser] = useState<User>()
  useEffect(() => {
    async function fetchUser() {
      const { data: user } = await getUser({ userId: props.node.attrs.id })
      setUser(user)
    }

    void fetchUser()
  }, [props.node.attrs.id])

  return user ? (
    <NodeViewWrapper
      as={props.editor.isEditable ? 'span' : Link}
      className="inline-flex items-center gap-1 rounded-md border border-primary bg-primary/10 px-1 font-normal text-primary-foreground dark:text-secondary-foreground"
      href={`/${user.username}`}
      style={{ verticalAlign: 'text-bottom', lineHeight: 1.1, textDecoration: 'none' }}
    >
      <UserAvatar imgClassName="m-0" size="sm" user={user} />
      {user.displayName}
    </NodeViewWrapper>
  ) : null
}

export function EditorExtensions({ children }: { children: React.ReactNode }) {
  return (
    <EditorExtensionsProvider
      extensions={[
        Mention.extend({
          content: 'inline*',
          addNodeView() {
            return ReactNodeViewRenderer(MentionChip)
          },
          parseHTML() {
            return [{ tag: 'mention' }]
          },
          renderHTML({ HTMLAttributes }) {
            return ['mention', mergeAttributes(HTMLAttributes)]
          },
        }).configure({
          suggestion,
        }),
      ]}
    >
      {children}
    </EditorExtensionsProvider>
  )
}
