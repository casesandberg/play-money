import { UserProfilePage } from '@play-money/users/components/UserProfilePage'

export default function AppUsernamePage({
  params,
  searchParams,
}: {
  params: { username: string }
  searchParams: { pageSize?: string; page?: string; sort?: string; status?: string }
}) {
  return (
    <UserProfilePage
      filters={{
        pageSize: searchParams.pageSize,
        page: searchParams.page,
        status: searchParams.status as 'active' | 'closed' | 'all' | undefined,
        sortField: searchParams.sort?.split('-')[0],
        sortDirection: searchParams.sort?.split('-')[1],
      }}
      username={params.username}
    />
  )
}
