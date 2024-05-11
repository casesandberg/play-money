import Image from 'next/image'

import Link from 'next/link'
import { cn } from '@play-money/ui/utils'
import { Input } from '@play-money/ui/input'

import { UserNav } from '@play-money/users/components/UserNav'

// export function Search() {
//   return (
//     <div>
//       <Input type="search" placeholder="Search..." className="md:w-[100px] lg:w-[300px]" />
//     </div>
//   )
// }

function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav className={cn('flex items-center space-x-4 lg:space-x-6', className)} {...props}>
      <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
        Markets
      </Link>
      <Link href="/create-post" className="text-sm font-medium transition-colors hover:text-primary">
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
            {/* <Search /> */}
            <UserNav />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">{children}</div>
    </div>
  )
}
