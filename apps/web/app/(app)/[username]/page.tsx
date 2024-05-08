import { UserProfilePage } from '@play-money/users/pages/UserProfilePage'

export default function AppUsernamePage({ params }: { params: { username: string } }) {
  return <UserProfilePage username={params.username} />
}
