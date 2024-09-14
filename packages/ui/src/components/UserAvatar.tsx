import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

const userAvatarVariants = cva('', {
  variants: {
    size: {
      default: 'h-8 w-8',
      sm: 'h-4 w-4',
      lg: 'h-16 w-16',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export function UserAvatar({
  user,
  size,
  className,
  imgClassName,
}: VariantProps<typeof userAvatarVariants> & {
  user: { username: string; avatarUrl?: string | null; id: string }
  className?: string
  imgClassName?: string
}) {
  return (
    <Avatar className={cn(userAvatarVariants({ size, className }))}>
      <AvatarImage
        alt={`@${user.username}`}
        className={cn(imgClassName)}
        src={user.avatarUrl ?? `https://api.dicebear.com/8.x/initials/svg?seed=${user.username}&scale=75`}
      />
      <AvatarFallback />
    </Avatar>
  )
}
