'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Decimal from 'decimal.js'
import _ from 'lodash'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { createMarketSell, getMarketQuote } from '@play-money/api-helpers/client'
import { MarketOption } from '@play-money/database'
import { MarketOptionPositionAsNumbers } from '@play-money/finance/lib/getBalances'
import { Button } from '@play-money/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@play-money/ui/form'
import { Input } from '@play-money/ui/input'
import { RadioGroup, RadioGroupItem } from '@play-money/ui/radio-group'
import { Slider } from '@play-money/ui/slider'
import { toast } from '@play-money/ui/use-toast'
import { QuoteItem, calculateReturnPercentage, formatCurrency, formatPercentage } from './MarketBuyForm'

const FormSchema = z.object({
  optionId: z.string(),
  amount: z.coerce.number().min(1, { message: 'Amount must be greater than zero' }),
})

type FormData = z.infer<typeof FormSchema>

export function MarketSellForm({
  marketId,
  options,
  positions,
  onComplete,
}: {
  marketId: string
  options: Array<MarketOption>
  positions?: Array<MarketOptionPositionAsNumbers>
  onComplete?: () => void
}) {
  const [max, setMax] = useState(0)
  const [quote, setQuote] = useState<{ newProbability: number; potentialReturn: number } | null>(null)
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      amount: '' as unknown as number, // Fix uncontrolled component error
      optionId: options[0].id,
    },
  })

  const selectedOption = options.find((o) => o.id === form.getValues('optionId'))
  const selectedPosition = positions?.find((p) => p.optionId === form.getValues('optionId'))

  const onSubmit = async (data: FormData) => {
    try {
      await createMarketSell({ marketId: marketId, optionId: data.optionId, amount: data.amount })
      toast({ title: 'Shares sold successfully' })
      form.reset({ amount: 0 })
      setQuote(null)
      onComplete?.()
    } catch (error: any) {
      console.error('Failed to place bet:', error)
      toast({
        title: 'There was an issue selling shares',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      })
    }
  }

  const fetchQuote = async (amount: number, optionId: string) => {
    try {
      const data = await getMarketQuote({ marketId, optionId, amount, isBuy: false })
      setQuote(data)
    } catch (error) {
      console.error('Failed to fetch quote:', error)
    }
  }

  useEffect(() => {
    form.setValue('optionId', options[0].id)
  }, [options])

  useEffect(() => {
    if (selectedPosition?.quantity) {
      setMax(selectedPosition.quantity)
      form.setValue('amount', Math.round(selectedPosition.quantity / 2))
    } else {
      form.setValue('amount', 0)
    }
  }, [form.watch('optionId'), selectedPosition])

  useEffect(() => {
    const amount = form?.getValues('amount')
    const optionId = form?.getValues('optionId')
    if (amount && optionId) {
      fetchQuote(amount, optionId)
    }

    const subscription = form.watch(({ amount, optionId }) => {
      if (amount && optionId) {
        fetchQuote(amount, optionId)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, options])

  const proportionateCost =
    (form.getValues('amount') * (selectedPosition?.cost || 0)) / (selectedPosition?.quantity || 0)
  const disabled = !selectedPosition || new Decimal(selectedPosition.quantity).toDecimalPlaces(4).lt(0)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {options.length > 1 ? (
          <FormField
            control={form.control}
            name="optionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Option</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1">
                    {options.map((option) => (
                      <FormItem key={option.id} className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={option.id} />
                        </FormControl>
                        <FormLabel className="font-normal">{option.name}</FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
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
              <FormLabel className="flex items-center justify-between">Amount</FormLabel>
              <FormControl>
                <div>
                  <Slider
                    className="my-4"
                    min={1}
                    max={max}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    disabled={disabled}
                  />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="100"
                      {...field}
                      onChange={(e) => field.onChange(e.currentTarget.valueAsNumber)}
                      className="h-9 font-mono"
                      disabled={disabled}
                    />

                    <Button
                      size="sm"
                      type="button"
                      variant="secondary"
                      onClick={() => field.onChange(max)}
                      disabled={disabled}
                    >
                      MAX
                    </Button>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full truncate" loading={form.formState.isSubmitting} disabled={disabled}>
          Sell {_.truncate(selectedOption?.name, { length: 20 })}
        </Button>

        <ul className="grid gap-1 text-sm">
          <QuoteItem
            label="Potential return"
            value={quote?.potentialReturn}
            formatter={formatCurrency}
            percent={calculateReturnPercentage(quote?.potentialReturn, proportionateCost)}
          />
          <QuoteItem label="New probability" value={quote?.newProbability} formatter={formatPercentage} />
        </ul>
      </form>
    </Form>
  )
}
