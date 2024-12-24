import { revalidateTag } from 'next/cache'
import React from 'react'
import { getMarketComments } from '@play-money/api-helpers/client'
import { CommentsList } from '@play-money/comments/components/CommentsList'

export async function MarketComments({ marketId }: { marketId: string }) {
  const { data: comments } = await getMarketComments({ marketId })

  const handleRevalidate = async () => {
    'use server'
    revalidateTag(`${marketId}:comments`)
  }

  return <CommentsList comments={comments} entity={{ type: 'MARKET', id: marketId }} onRevalidate={handleRevalidate} />
}
