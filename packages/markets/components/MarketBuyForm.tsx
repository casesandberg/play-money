'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import _ from 'lodash'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { createMarketBuy, getMarketQuote } from '@play-money/api-helpers/client'
import { MarketOption } from '@play-money/database'
import { DAILY_TRADE_BONUS_PRIMARY } from '@play-money/finance/economy'
import { Button } from '@play-money/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@play-money/ui/form'
import { Input } from '@play-money/ui/input'
import { RadioGroup, RadioGroupItem } from '@play-money/ui/radio-group'
import { toast } from '@play-money/ui/use-toast'
import { cn } from '@play-money/ui/utils'

const FormSchema = z.object({
  optionId: z.string(),
  amount: z.coerce.number().min(1, { message: 'Amount must be greater than zero' }),
})

type FormData = z.infer<typeof FormSchema>

export function MarketBuyForm({
  marketId,
  options,
  onComplete,
}: {
  marketId: string
  options: Array<MarketOption>
  onComplete?: () => void
}) {
  const [quote, setQuote] = useState<{ newProbability: number; potentialReturn: number } | null>(null)
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      amount: DAILY_TRADE_BONUS_PRIMARY,
      optionId: options[0].id,
    },
  })

  const selectedOption = options.find((o) => o.id === form.getValues('optionId'))

  const onSubmit = async (data: FormData) => {
    try {
      await createMarketBuy({ marketId, optionId: data.optionId, amount: data.amount })
      toast({ title: 'Bet placed successfully' })
      form.reset({ amount: DAILY_TRADE_BONUS_PRIMARY })
      setQuote(null)
      onComplete?.()
    } catch (error: any) {
      console.error('Failed to place bet:', error)
      toast({
        title: 'There was an issue placing your bet',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      })
    }
  }

  const fetchQuote = async (amount: number, optionId: string) => {
    try {
      const data = await getMarketQuote({ marketId, optionId, amount })
      setQuote(data)
    } catch (error) {
      console.error('Failed to fetch quote:', error)
    }
  }

  useEffect(() => {
    form.setValue('optionId', options[0].id)
  }, [options])

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

  const orderedOptions = _.orderBy(options, 'createdAt')

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {orderedOptions.length > 1 ? (
          <FormField
            control={form.control}
            name="optionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Option</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1">
                    {orderedOptions.map((option) => (
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
              <FormLabel className="flex items-center justify-between">
                Amount
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    type="button"
                    variant="secondary"
                    className="h-6 px-2 font-mono"
                    onClick={() => field.onChange((field.value || 0) + DAILY_TRADE_BONUS_PRIMARY)}
                  >
                    +{DAILY_TRADE_BONUS_PRIMARY}
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="secondary"
                    className="h-6 px-2 font-mono"
                    onClick={() => field.onChange((field.value || 0) + 250)}
                  >
                    +250
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="secondary"
                    className="h-6 px-2 font-mono"
                    onClick={() => field.onChange((field.value || 0) + 1000)}
                  >
                    +1k
                  </Button>
                </div>
              </FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder={String(DAILY_TRADE_BONUS_PRIMARY)}
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

        <Button type="submit" className="w-full truncate" loading={form.formState.isSubmitting}>
          Buy {_.truncate(selectedOption?.name, { length: 20 })}
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

// TODO: Create format components and using existing currency component
export const formatCurrency = (value: number) => `🎃${Math.round(value)}`

export const formatPercentage = (value: number) => `${value}%`

export const calculateReturnPercentage = (potentialReturn = 0, amount = 0) => {
  return ((potentialReturn - amount) / amount) * 100
}

export const QuoteItem = ({
  label,
  value,
  percent,
  formatter = (value) => value.toString(),
  className,
}: {
  label: string
  value?: number
  percent?: number
  formatter?: (value: number) => string
  className?: string
}) => (
  <li className="flex items-center justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span
      className={cn(
        'font-mono font-semibold',
        value
          ? percent
            ? percent > 0
              ? 'text-green-500'
              : percent < 0
                ? 'text-red-500'
                : 'text-foreground'
            : 'text-foreground'
          : 'text-muted-foreground'
      )}
    >
      {value ? (percent ? `${formatter(value)} (${Math.round(percent)}%)` : formatter(value)) : '—'}
    </span>
  </li>
)
