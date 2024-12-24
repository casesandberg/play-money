import { revalidateTag } from 'next/cache'
import { getExtendedList } from '@play-money/api-helpers/client'
import { ListPageLayout } from '@play-money/lists/components/ListPageLayout'

export default async function AppListsLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { listId: string }
}) {
  const { data: list } = await getExtendedList({ listId: params.listId })

  // eslint-disable-next-line @typescript-eslint/require-await -- Next requires this to be async since its SSR
  const handleRevalidate = async () => {
    'use server'
    revalidateTag(`market:${params.listId}`)
  }

  return (
    <ListPageLayout list={list} onRevalidate={handleRevalidate}>
      {children}
    </ListPageLayout>
  )
}
