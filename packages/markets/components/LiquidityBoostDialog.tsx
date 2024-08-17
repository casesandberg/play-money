'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import _ from 'lodash'
import React from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { CurrencyDisplay } from '@play-money/currencies/components/CurrencyDisplay'
import { formatNumber } from '@play-money/currencies/lib/formatCurrency'
import { Market } from '@play-money/database'
import { Button } from '@play-money/ui/button'
import { Card } from '@play-money/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@play-money/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@play-money/ui/form'
import { Input } from '@play-money/ui/input'
import { toast } from '@play-money/ui/use-toast'

const FormSchema = z.object({
  amount: z.coerce.number().min(1, { message: 'Amount must be greater than zero' }),
})
type FormData = z.infer<typeof FormSchema>

export type MarketStats = {
  totalLiquidity: number
  lpUserCount: number
  traderBonusPayouts: number
  positions: Record<
    string,
    {
      cost: number
      value: number
      shares: number
      payout: number
    }
  >
  earnings: {
    traderBonusPayouts?: number
    held?: number
    sold?: number
  }
}

export const LiquidityBoostDialog = ({
  open,
  onClose,
  onSuccess,
  market,
  stats,
}: {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  market: Market
  stats?: MarketStats
}) => {
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  })

  const {
    formState: { isSubmitting, isDirty, isValid },
  } = form

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/markets/${market.id}/liquidity`, {
        method: 'POST',
        body: JSON.stringify(data),
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message)
      }

      toast({ title: `$${data.amount} liquidity added!` })
      form.reset()
      onSuccess?.()
      onClose()
    } catch (error: any) {
      console.error('Failed to add liquidity:', error)
      toast({
        title: 'There was an issue adding liquidity',
        description: error.message ?? 'Please try again later',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="line-clamp-1 pr-4 text-purple-600">Boost {market.question}</DialogTitle>
        </DialogHeader>

        <DialogDescription>
          Add liquidity to this markets and earn a share of trader bonuses. Any unused liquidity is returned
          proportionally when the market resolves.
        </DialogDescription>

        {stats ? (
          <Card className="bg-muted p-4">
            <div className="space-y-1 ">
              <div className="font-semibold">Market stats</div>
              <ul className="grid gap-1 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Existing liquidity</span>
                  <span className="font-medium">
                    <CurrencyDisplay value={stats.totalLiquidity} />
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Liquidity providers</span>
                  <span className="font-medium">{formatNumber(stats.lpUserCount)}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Unique trader bonuses</span>
                  <span className="font-medium">
                    <CurrencyDisplay value={stats.traderBonusPayouts} />
                  </span>
                </li>
              </ul>
            </div>
          </Card>
        ) : null}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    Amount
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        type="button"
                        variant="secondary"
                        className="h-6 px-2 font-mono"
                        onClick={() => field.onChange((field.value || 0) + 1000)}
                      >
                        +1000
                      </Button>
                      <Button
                        size="sm"
                        type="button"
                        variant="secondary"
                        className="h-6 px-2 font-mono"
                        onClick={() => field.onChange((field.value || 0) + 5000)}
                      >
                        +5k
                      </Button>
                      <Button
                        size="sm"
                        type="button"
                        variant="secondary"
                        className="h-6 px-2 font-mono"
                        onClick={() => field.onChange((field.value || 0) + 25000)}
                      >
                        +25k
                      </Button>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        type="number"
                        placeholder="1000"
                        {...field}
                        onChange={(e) => field.onChange(e.currentTarget.valueAsNumber)}
                        className="h-9 font-mono"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button disabled={!isDirty || !isValid} loading={isSubmitting} type="submit">
              Add liquidity
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
