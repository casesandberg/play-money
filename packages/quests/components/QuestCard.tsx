import Link from 'next/link'
import { CurrencyDisplay } from '@play-money/currencies/components/CurrencyDisplay'
import { Badge } from '@play-money/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@play-money/ui/card'
import { cn } from '@play-money/ui/utils'

export type Quest = {
  title: string
  award: number
  href: string
  completed: boolean
}

export function QuestCard({ quests }: { quests: Quest[] }) {
  const numComplete = quests.filter((quest) => quest.completed).length
  const allComplete = numComplete === quests.length

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="border-b md:py-3">
        <CardTitle className="flex justify-between md:text-lg">
          Daily Quests
          <Badge variant="outline">{`${numComplete} / ${quests.length} complete`}</Badge>
        </CardTitle>
      </CardHeader>
      {!allComplete ? (
        <CardContent className="mt-4 grid gap-4">
          <div className="grid gap-2">
            {quests.map((quest) => (
              <Link href={quest.href} key={quest.title}>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p
                      className={cn(
                        'line-clamp-1 text-sm font-medium',
                        quest.completed && 'text-muted-foreground line-through'
                      )}
                    >
                      {quest.title}
                    </p>
                  </div>
                  {!quest.completed && (
                    <Badge>
                      <CurrencyDisplay value={quest.award} />
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      ) : null}
    </Card>
  )
}
