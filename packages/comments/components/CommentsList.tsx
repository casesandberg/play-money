'use client'

import React, { useState, useEffect } from 'react'
import { createComment, createCommentReaction, deleteComment, updateComment } from '@play-money/api-helpers/client'
import { CommentWithReactions } from '@play-money/comments/lib/getComment'
import { toast } from '@play-money/ui/use-toast'
import { useUser } from '@play-money/users/context/UserContext'
import { flattenReplies } from '../lib/flattenReplies'
import { CommentItem } from './CommentItem'
import { CreateCommentForm } from './CreateCommentForm'

export function CommentsList({
  comments,
  entity,
  onRevalidate,
}: {
  comments: Array<CommentWithReactions>
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
    <div>
      <div className="px-6 py-4">
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
