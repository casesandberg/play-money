import { UserProfilePage } from '@play-money/users/components/UserProfilePage'

export default function AppUsernamePage({ params }: { params: { username: string } }) {
  return <UserProfilePage username={params.username} />
}
