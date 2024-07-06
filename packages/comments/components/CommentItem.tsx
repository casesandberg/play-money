'use client'

import { formatDistance } from 'date-fns'
import { Ellipsis, Reply } from 'lucide-react'
import React, { useState } from 'react'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@play-money/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@play-money/ui/avatar'
import { Button } from '@play-money/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@play-money/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@play-money/ui/dropdown-menu'
import { Editor } from '@play-money/ui/editor'
import { EmojiPicker, EmojiReactionList } from '@play-money/ui/emoji'
import { toast } from '@play-money/ui/use-toast'
import { cn } from '@play-money/ui/utils'
import { UserLink } from '@play-money/users/components/UserLink'
import { MarketComment } from '../lib/getCommentsOnMarket'
import { CreateCommentForm } from './CreateCommentForm'

export function CommentItem({
  activeUserId,
  comment,
  isHighlighted,
  onEmojiSelect,
  onCreateReply,
  onEdit,
  onDelete,
}: {
  activeUserId: string
  comment: MarketComment
  isHighlighted?: boolean
  onEmojiSelect: (emoji: string) => void
  onCreateReply: (content: string) => Promise<void>
  onEdit: (content: string) => Promise<void>
  onDelete: () => void
}) {
  const [isReplyOpen, setIsReplyOpen] = useState(false)
  const [isPortalOpen, setIsPortalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const handleCreateReply = async (content: string) => {
    await onCreateReply(content)
    setIsReplyOpen(false)
  }

  const handleCancelReply = () => {
    setIsReplyOpen(false)
  }

  const handleEdit = async (content: string) => {
    await onEdit(content)
    setIsEditing(false)
  }

  const handleCopyLink = () => {
    const currentUrl = window.location.href
    const urlWithCommentId = `${currentUrl}#${comment.id}`
    navigator.clipboard
      .writeText(urlWithCommentId)
      .then(() => {
        toast({ title: 'Link copied to clipboard!' })
      })
      .catch((err) => {
        console.error('Failed to copy link: ', err)
      })
  }

  return (
    <div
      id={comment.id}
      className={cn(
        isHighlighted && 'bg-primary/10 ring-2 ring-primary ring-offset-2',
        'group flex flex-row gap-4 rounded-md px-6 py-2 hover:bg-muted/50',
        (isReplyOpen || isPortalOpen) && 'bg-muted/50'
      )}
    >
      <Avatar className="mt-2 h-8 w-8">
        <AvatarImage src={comment.author.avatarUrl ?? ''} alt={`@${comment.author.username}`} />
        <AvatarFallback>{comment.author.username.toUpperCase().slice(0, 2)}</AvatarFallback>
      </Avatar>

      <Collapsible open={isReplyOpen} onOpenChange={setIsReplyOpen}>
        <div className="flex flex-row items-center gap-4">
          <UserLink user={comment.author} className="truncate" />

          <div className="flex-shrink-0 text-sm text-muted-foreground">
            {formatDistance(comment.createdAt, new Date(), { addSuffix: true })}
          </div>

          {comment.edited && <div className="flex-shrink-0 text-sm text-muted-foreground">(edited)</div>}

          <div
            className={cn(
              '-my-2 -mr-2 ml-auto flex flex-row items-center opacity-0 transition-opacity group-hover:opacity-100',
              (isReplyOpen || isPortalOpen) && 'opacity-100',
              'hidden md:flex'
            )}
          >
            <EmojiPicker buttonProps={{ variant: 'ghost' }} onSelect={onEmojiSelect} onOpenChange={setIsPortalOpen} />

            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon">
                <Reply className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>

            <DropdownMenu onOpenChange={setIsPortalOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Ellipsis className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                onCloseAutoFocus={(e) => {
                  // Dont focus DropdownMenuTrigger on close, messes with edit editor auto-focus
                  e.preventDefault()
                }}
              >
                <DropdownMenuItem onClick={handleCopyLink}>Copy Link</DropdownMenuItem>

                {activeUserId === comment.author.id ? (
                  <>
                    <DropdownMenuItem
                      onSelect={() => {
                        setIsEditing(true)
                      }}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
                          onSelect={(e) => e.preventDefault()}
                        >
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently delete your comment.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <Button variant="destructive" onClick={onDelete}>
                              Continue
                            </Button>
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div>
          {isEditing ? (
            <div className="my-2">
              <CreateCommentForm
                initialContent={comment.content}
                variant="edit"
                onSubmit={handleEdit}
                onCancel={() => setIsEditing(false)}
                focusOnRender
              />
            </div>
          ) : (
            <Editor className="min-h-6" value={comment.content} disabled />
          )}
        </div>

        <EmojiReactionList
          activeUserId={activeUserId}
          reactions={comment.reactions}
          pickerClassName={cn(
            'opacity-0 transition-opacity group-hover:opacity-100',
            (isReplyOpen || isPortalOpen) && 'opacity-100'
          )}
          onSelect={onEmojiSelect}
          onOpenChange={setIsPortalOpen}
        />

        <CollapsibleContent>
          <div className="mt-2">
            <CreateCommentForm
              variant="reply"
              onSubmit={handleCreateReply}
              onCancel={handleCancelReply}
              focusOnRender
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
