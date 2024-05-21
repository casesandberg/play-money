'use client'

import _ from 'lodash'
import React, { useState, useEffect } from 'react'
import { z } from 'zod'
import { CommentSchema } from '@play-money/database'
import { useUser } from '@play-money/users/context/UserContext'
import { flattenReplies } from '../lib/flattenReplies'
import { MarketCommentSchema } from '../lib/getCommentsOnMarket'
import { CommentItem } from './CommentItem'
import { CreateCommentForm } from './CreateCommentForm'

export function CommentsList({
  comments,
  entity,
  onRevalidate,
}: {
  comments: Array<z.infer<typeof MarketCommentSchema>>
  entity: { type: string; id: string }
  onRevalidate: () => void
}) {
  const { user } = useUser()
  const nestedComments = flattenReplies(comments)
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null)

  useEffect(function highlightCommentFromURL() {
    const url = new URL(window.location.href)
    const possibleCommentId = url.hash.substring(1)

    // Check if the comment exists in the list
    if (possibleCommentId && comments.find(({ id }) => id === possibleCommentId)) {
      setHighlightedCommentId(possibleCommentId)

      const element = document.getElementById(possibleCommentId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [])

  const handleToggleEmojiReaction = (commentId: string) => async (emoji: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/comments/${commentId}/reaction`, {
      method: 'POST',
      body: JSON.stringify({
        emoji,
        commentId,
      }),
      credentials: 'include',
    })
    onRevalidate()
  }

  const handleCreateReply = (parentId?: string) => async (content: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/comments`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        parentId,
        entityType: entity.type,
        entityId: entity.id,
      }),
      credentials: 'include',
    })
    onRevalidate()
  }

  const handleEdit = (commentId: string) => async (content: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/comments/${commentId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        content,
      }),
      credentials: 'include',
    })
    onRevalidate()
  }

  const handleDelete = (commentId: string) => async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/comments/${commentId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    onRevalidate()
  }

  return (
    <div>
      <div className="p-4">
        <CreateCommentForm onSubmit={handleCreateReply()} />
      </div>
      {nestedComments.map((comment) => (
        <div key={comment.id}>
          <CommentItem
            activeUserId={user?.id || ''}
            comment={comment}
            isHighlighted={highlightedCommentId === comment.id}
            onEmojiSelect={handleToggleEmojiReaction(comment.id)}
            onCreateReply={handleCreateReply(comment.id)}
            onEdit={handleEdit(comment.id)}
            onDelete={handleDelete(comment.id)}
          />
          <div className="ml-12">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                activeUserId={user?.id || ''}
                comment={reply}
                isHighlighted={highlightedCommentId === reply.id}
                onEmojiSelect={handleToggleEmojiReaction(reply.id)}
                onCreateReply={handleCreateReply(reply.id)}
                onEdit={handleEdit(reply.id)}
                onDelete={handleDelete(reply.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
