'use client'

import React from 'react'
import { Button } from '@play-money/ui/button'
import { cn } from '@play-money/ui/utils'
import { GlobalSearchMenu } from './GlobalSearchMenu'

export function GlobalSearchTriggerLink({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <>
      <Button className={cn('p-0', className)} variant="link" onClick={() => setOpen(true)}>
        Search
      </Button>

      <GlobalSearchMenu open={open} onOpenChange={setOpen} />
    </>
  )
}
