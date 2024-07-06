import { MenuIcon } from 'lucide-react'
import Link from 'next/link'
import { ActiveUserBalance } from '@play-money/accounts/components/ActiveUserBalance'
import { GlobalSearchTrigger } from '@play-money/search/components/GlobalSearchTrigger'
import { Button } from '@play-money/ui/button'
import { Sheet, SheetTrigger, SheetContent } from '@play-money/ui/sheet'
import { cn } from '@play-money/ui/utils'
import { UserNav } from '@play-money/users/components/UserNav'

function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav className={cn('flex items-center text-sm', className)} {...props}>
      <Link className="font-medium transition-colors hover:text-primary" href="/questions">
        Markets
      </Link>
      <Link className="font-medium transition-colors hover:text-primary" href="/create-post">
        Create Market
      </Link>
    </nav>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header className="flex w-full flex-col justify-between border-b">
        <div className="flex h-16 items-center justify-between gap-4 px-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="md:hidden" size="icon" variant="outline">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col gap-4">
                <div className="text-lg text-muted-foreground">Play Money</div>
                <GlobalSearchTrigger />
                <MainNav className="flex flex-col items-start space-y-4 text-lg" />
              </div>
            </SheetContent>
          </Sheet>
          <Link className="flex items-center" href="/">
            <span>Play Money</span>
          </Link>
          <div className="ml-auto flex items-center space-x-4">
            <MainNav className="hidden gap-6 md:flex" />
            <ActiveUserBalance />
            <GlobalSearchTrigger className="hidden md:flex" />
            <UserNav />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-screen-xl flex-1 space-y-4 p-4 md:p-8">{children}</div>
    </div>
  )
}
