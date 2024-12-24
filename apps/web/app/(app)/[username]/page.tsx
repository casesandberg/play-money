import { UserProfilePage } from '@play-money/users/components/UserProfilePage'

export default function AppUsernamePage({
  params,
  searchParams,
}: {
  params: { username: string }
  searchParams: { limit?: string; cursor?: string; sort?: string; status?: string }
}) {
  return (
    <UserProfilePage
      filters={{
        limit: searchParams.limit,
        cursor: searchParams.cursor,
        status: searchParams.status as 'active' | 'closed' | 'all' | undefined,
        sortField: searchParams.sort?.split('-')[0],
        sortDirection: searchParams.sort?.split('-')[1] as 'asc' | 'desc' | undefined,
      }}
      username={params.username}
    />
  )
}
