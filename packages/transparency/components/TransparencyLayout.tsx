'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { buttonVariants } from '@play-money/ui/button'
import { cn } from '@play-money/ui/utils'

export function TransparencyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-1 flex-col gap-8 md:flex-row">
      <aside className="md:w-[200px]">
        <nav className="flex flex-wrap space-x-2 md:flex-col md:space-x-0 md:space-y-1">
          <div className="mb-4 ml-4 w-full font-semibold text-muted-foreground md:w-auto">Transparency</div>
          <Link
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              pathname === '/transparency/stats' ? 'bg-muted hover:bg-muted' : 'hover:bg-transparent hover:underline',
              'justify-start'
            )}
            href="/transparency/stats"
          >
            Stats
          </Link>
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  )
}
