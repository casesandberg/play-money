import Link from 'next/link'
import { GlobalSearchTrigger } from '@play-money/search/components/GlobalSearchTrigger'
import { cn } from '@play-money/ui/utils'
import { UserNav } from '@play-money/users/components/UserNav'

function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav className={cn('flex items-center space-x-4 lg:space-x-6', className)} {...props}>
      <Link className="text-sm font-medium transition-colors hover:text-primary" href="/">
        Markets
      </Link>
      <Link className="text-sm font-medium transition-colors hover:text-primary" href="/create-post">
        Create Market
      </Link>
    </nav>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <Link href="/">PlayMoney</Link>
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <GlobalSearchTrigger />
            <UserNav />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">{children}</div>
    </div>
  )
}
