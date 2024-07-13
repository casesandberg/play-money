import { DiamondPlus, ArrowRight } from 'lucide-react'
import React from 'react'
import { Spotlight, useSpotlight } from '@play-money/ui/Spotlight'
import { Alert, AlertDescription, AlertTitle } from '@play-money/ui/alert'
import { Button } from '@play-money/ui/button'
import { cn } from '@play-money/ui/utils'

export function LiquidityBoostAlert({ onClick }: { onClick: () => void }) {
  const { mouseX, mouseY, handleMouseMove, classNames } = useSpotlight()

  return (
    <Alert className={cn('[&>svg]:text-purple-600', classNames)} onMouseMove={handleMouseMove}>
      <DiamondPlus className="h-4 w-4" />
      <AlertDescription className="text-muted-foreground">
        Boost the liquidity on this market to earn trader bonuses, and more!
      </AlertDescription>
      <AlertTitle className="mb-0">
        <Button variant="link" className="h-auto p-0 text-purple-600 underline" onClick={onClick}>
          Add Liquidity Boost
          <ArrowRight className="h-4 w-4" />
        </Button>
      </AlertTitle>

      <Spotlight mouseX={mouseX} mouseY={mouseY} color="purple" />
    </Alert>
  )
}
