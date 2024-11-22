'use client'

import React, { useState, useEffect } from 'react'
import { createComment, createCommentReaction, deleteComment, updateComment } from '@play-money/api-helpers/client'
import { CommentWithReactions } from '@play-money/comments/lib/getComment'
import { CommentEntityType } from '@play-money/database'
import { Card } from '@play-money/ui/card'
import { toast } from '@play-money/ui/use-toast'
import { useUser } from '@play-money/users/context/UserContext'
import { CommentItem } from './CommentItem'

export function CommentItemCard({
  comment,
  entity,
  onRevalidate,
}: {
  comment: CommentWithReactions
  entity: { type: CommentEntityType; id: string }
  onRevalidate: () => void
}) {
  const { user } = useUser()
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null)

  useEffect(function highlightCommentFromURL() {
    const url = new URL(window.location.href)
    const possibleCommentId = url.hash.substring(1)

    if (possibleCommentId && comment.id === possibleCommentId) {
      setHighlightedCommentId(possibleCommentId)

      const element = document.getElementById(possibleCommentId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [])

  const handleToggleEmojiReaction = (commentId: string) => async (emoji: string) => {
    await createCommentReaction({ commentId, emoji })
    onRevalidate()
  }

  const handleCreateReply = (parentId?: string) => async (content: string) => {
    try {
      await createComment({ content, parentId, entity })
      onRevalidate()
    } catch (error) {
      toast({
        title: 'There was an error creating your comment',
        description: (error as Error).message,
      })
    }
  }

  const handleEdit = (commentId: string) => async (content: string) => {
    await updateComment({ commentId, content })
    onRevalidate()
  }

  const handleDelete = (commentId: string) => async () => {
    await deleteComment({ commentId })
    onRevalidate()
  }

  return (
    <Card>
      <CommentItem
        activeUserId={user?.id || ''}
        comment={comment}
        condensed
        isHighlighted={highlightedCommentId === comment.id}
        onEmojiSelect={handleToggleEmojiReaction(comment.id)}
        onCreateReply={handleCreateReply(comment.id)}
        onEdit={handleEdit(comment.id)}
        onDelete={handleDelete(comment.id)}
      />
    </Card>
  )
}
