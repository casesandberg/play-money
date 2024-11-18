import { formatDistanceToNowShort } from '../../ui/src/helpers'

export function SiteActivityItem({
  children,
  icon,
  timestampAt,
  isFirst = false,
  isLast = false,
}: {
  children: React.ReactNode
  icon: React.ReactNode
  timestampAt: Date
  isFirst?: boolean
  isLast?: boolean
}) {
  return (
    <div className="flex flex-row">
      <div className="relative -ml-1 mr-2 flex w-6 items-center justify-center">
        {!isLast ? (
          <div className="absolute -bottom-4 left-0 top-1/2 flex w-6 justify-center">
            <div className="w-px bg-border" />
          </div>
        ) : null}
        {!isFirst ? (
          <div className="absolute -top-4 bottom-1/2 left-0 flex w-6 justify-center">
            <div className="w-px bg-border" />
          </div>
        ) : null}

        <div className="relative -m-1  bg-background p-1">{icon}</div>
      </div>
      <div className="flex-1">
        <div className="text-sm text-muted-foreground">
          {children} <span className="px-0.5">·</span>{' '}
          <time dateTime={timestampAt.toString()}>{formatDistanceToNowShort(timestampAt)}</time>
        </div>
      </div>
    </div>
  )
}
