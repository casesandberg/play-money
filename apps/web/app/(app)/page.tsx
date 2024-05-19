import { MarketComments } from '@play-money/comments/components/MarketComments'

export default function AppPage() {
  return (
    <div>
      <div>Home</div>

      <div className="w-[700px]">
        <MarketComments marketId="lounge_room_id" />
      </div>
    </div>
  )
}
