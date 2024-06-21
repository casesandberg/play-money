'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import _ from 'lodash'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { Button } from '@play-money/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@play-money/ui/form'
import { Input } from '@play-money/ui/input'
import { Slider } from '@play-money/ui/slider'
import { toast } from '@play-money/ui/use-toast'
import { cn } from '@play-money/ui/utils'
import { QuoteItem, calculateReturnPercentage, formatCurrency, formatPercentage } from './MarketBuyForm'
import { ExtendedMarket } from './MarketOverviewPage'

const FormSchema = z.object({
  amount: z.coerce.number().min(1, { message: 'Amount must be greater than zero' }),
})

type FormData = z.infer<typeof FormSchema>

export function MarketSellForm({
  marketId,
  option,
  max: initialMax,
  onComplete,
}: {
  marketId: string
  option: ExtendedMarket['options'][0]
  max?: number
  onComplete?: () => void
}) {
  const [max, setMax] = useState(initialMax)
  const [quote, setQuote] = useState<{ newProbability: number; potentialReturn: number } | null>(null)
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  })

  useEffect(() => {
    if (initialMax) {
      setMax(initialMax)
      form.setValue('amount', Math.round(initialMax / 2))
    } else {
      form.setValue('amount', 0)
    }
  }, [option.id, initialMax])

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/markets/${marketId}/sell`, {
        method: 'POST',
        body: JSON.stringify({
          optionId: option.id,
          amount: data.amount,
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message)
      }

      toast({ title: 'Shares sold successfully' })
      form.reset({ amount: 0 })
      setQuote(null)
      onComplete?.()
    } catch (error: any) {
      console.error('Failed to place bet:', error)
      toast({
        title: 'There was an issue selling shares',
        description: 'Please try again later',
        variant: 'destructive',
      })
    }
  }

  const fetchQuote = async (amount: number, optionId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/markets/${marketId}/quote`, {
        method: 'POST',
        body: JSON.stringify({ optionId, amount, isBuy: false }),
        credentials: 'include',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message)
      }

      setQuote(data)
    } catch (error) {
      console.error('Failed to fetch quote:', error)
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
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">Amount</FormLabel>
              <FormControl>
                <div>
                  <Slider
                    className="my-4"
                    min={1}
                    max={max}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="100"
                      {...field}
                      onChange={(e) => field.onChange(e.currentTarget.valueAsNumber)}
                      className="h-9"
                    />

                    <Button size="sm" type="button" variant="secondary" onClick={() => field.onChange(max)}>
                      MAX
                    </Button>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full truncate">
          Sell {_.truncate(option.name, { length: 20 })}
        </Button>

        <ul className="grid gap-1 text-sm">
          <QuoteItem
            label="Potential return"
            value={quote?.potentialReturn}
            formatter={formatCurrency}
            percent={calculateReturnPercentage(quote?.potentialReturn, form.getValues('amount'))}
          />
          <QuoteItem label="New probability" value={quote?.newProbability} formatter={formatPercentage} />
        </ul>
      </form>
    </Form>
  )
}
