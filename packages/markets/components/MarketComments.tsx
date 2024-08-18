import 'next'
import { revalidateTag } from 'next/cache'
import React from 'react'
import { getMarketComments } from '@play-money/api-helpers/client'
import { CommentsList } from '@play-money/comments/components/CommentsList'

declare module 'next' {
  interface NextFetchRequestConfig {
    tags?: Array<string>
  }
}

declare global {
  interface RequestInit {
    next?: NextFetchRequestConfig
  }
}

export async function MarketComments({ marketId }: { marketId: string }) {
  const { comments } = await getMarketComments({ marketId })

  const handleRevalidate = async () => {
    'use server'
    revalidateTag('comments')
  }

  return <CommentsList comments={comments} entity={{ type: 'MARKET', id: marketId }} onRevalidate={handleRevalidate} />
}
