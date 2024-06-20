'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import _ from 'lodash'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { Button } from '@play-money/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@play-money/ui/form'
import { Input } from '@play-money/ui/input'
import { toast } from '@play-money/ui/use-toast'
import { cn } from '@play-money/ui/utils'
import { ExtendedMarket } from './MarketOverviewPage'

const FormSchema = z.object({
  amount: z.coerce.number().min(1, { message: 'Amount must be greater than zero' }),
})

type FormData = z.infer<typeof FormSchema>

export function MarketBuyForm({
  marketId,
  option,
  hasOutcome,
  onComplete,
}: {
  marketId: string
  option: ExtendedMarket['options'][0]
  hasOutcome?: boolean
  onComplete?: () => void
}) {
  const [quote, setQuote] = useState<{ newProbability: number; potentialReturn: number } | null>(null)
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/markets/${marketId}/buy`, {
        method: 'POST',
        body: JSON.stringify({
          optionId: option.id,
          amount: data.amount,
        }),
        credentials: 'include',
      })
      toast({ title: 'Bet placed successfully' })
      form.reset()
      setQuote(null)
      onComplete?.()
    } catch (error: any) {
      console.error('Failed to place bet:', error)
      toast({ title: 'There was an issue placing your bet', description: 'Please try again later' })
    }
  }

  const fetchQuote = async (amount: number, optionId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/markets/${marketId}/quote`, {
        method: 'POST',
        body: JSON.stringify({ optionId, amount }),
        credentials: 'include',
      })
      const data = await response.json()
      setQuote(data)
    } catch (error) {
      console.error('Failed to fetch new probability and return:', error)
    }
  }

  useEffect(() => {
    const amount = form?.getValues('amount')
    if (amount && option.id) {
      fetchQuote(amount, option.id)
    }

    const subscription = form.watch(({ amount }) => {
      if (amount) {
        fetchQuote(amount, option.id)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, option.id])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {hasOutcome ? (
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Outcome</FormLabel>
                <FormControl>
                  <Button className="flex-1">Yes</Button>
                  <Button className="flex-1" variant="secondary">
                    No
                  </Button>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      type="button"
                      variant={String(field.value) === '100' ? 'default' : 'outline'}
                      onClick={() => field.onChange(100)}
                    >
                      100
                    </Button>
                    <Button
                      size="sm"
                      type="button"
                      variant={String(field.value) === '500' ? 'default' : 'outline'}
                      onClick={() => field.onChange(500)}
                    >
                      500
                    </Button>
                    <Button
                      size="sm"
                      type="button"
                      variant={String(field.value) === '5000' ? 'default' : 'outline'}
                      onClick={() => field.onChange(5000)}
                    >
                      5,000
                    </Button>
                  </div>
                  {/* <Input type="number" placeholder="Custom" {...field} className="h-9" /> */}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full truncate">
          Bet on {_.truncate(option.name, { length: 20 })}
        </Button>

        <ul className="grid gap-1 text-sm">
          <li className="flex items-center justify-between">
            <span className="text-muted-foreground">New probability</span>
            <span
              className={cn(
                'font-semibold',
                quote?.potentialReturn ? 'text-primary-foreground' : 'text-muted-foreground'
              )}
            >
              {quote?.newProbability ? `${Math.round(quote?.newProbability * 100)}%` : '—'}
            </span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-muted-foreground">Potential return</span>
            <span className={cn('font-semibold', quote?.potentialReturn ? 'text-green-500' : 'text-muted-foreground')}>
              {quote?.potentialReturn
                ? `$${Math.round(quote?.potentialReturn)} (${Math.round(((quote?.potentialReturn - form.getValues('amount')) / form.getValues('amount')) * 100)}%)`
                : '—'}
            </span>
          </li>
        </ul>
      </form>
    </Form>
  )
}
