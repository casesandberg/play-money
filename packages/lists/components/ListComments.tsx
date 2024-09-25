import { revalidateTag } from 'next/cache'
import React from 'react'
import { getListComments } from '@play-money/api-helpers/client'
import { CommentsList } from '@play-money/comments/components/CommentsList'

export async function ListComments({ listId }: { listId: string }) {
  const { comments } = await getListComments({ listId })

  const handleRevalidate = async () => {
    'use server'
    revalidateTag(`list:${listId}:comments`)
  }

  return <CommentsList comments={comments} entity={{ type: 'LIST', id: listId }} onRevalidate={handleRevalidate} />
}
