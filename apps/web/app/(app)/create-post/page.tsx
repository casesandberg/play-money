import { revalidateTag } from 'next/cache'
import { CreateMarketForm } from '@play-money/markets/components/CreateMarketForm'

export default function CreatePost() {
  // eslint-disable-next-line @typescript-eslint/require-await -- Await is required by next
  const handleRevalidate = async () => {
    'use server'
    revalidateTag('markets')
  }

  return <CreateMarketForm onSuccess={handleRevalidate} />
}
