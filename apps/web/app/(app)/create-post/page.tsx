'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import moment from 'moment'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { MarketSchema } from '@play-money/database'
import { Button } from '@play-money/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@play-money/ui/form'
import { Input } from '@play-money/ui/input'
import { Textarea } from '@play-money/ui/textarea'
import { toast } from '@play-money/ui/use-toast'

const marketCreateFormSchema = MarketSchema.pick({ question: true, description: true, closeDate: true })
type MarketCreateFormValues = z.infer<typeof marketCreateFormSchema>

export default function CreatePost() {
  return <CreateBinaryMarketForm />
}

function CreateBinaryMarketForm() {
  const tzName = /\((?<tz>[A-Za-z\s].*)\)/.exec(new Date().toString())?.groups?.tz ?? null

  const form = useForm<MarketCreateFormValues>({
    resolver: zodResolver(marketCreateFormSchema),
    defaultValues: {
      question: '',
      description: '',
      closeDate: moment().add(1, 'month').endOf('day').toDate(),
    },
  })

  async function onSubmit(market: MarketCreateFormValues) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/markets`, {
      method: 'POST',
      body: JSON.stringify(market),
      credentials: 'include',
    })

    if (!response.ok || response.status >= 400) {
      const { error } = (await response.json()) as { error: string }
      toast({
        title: 'There was an error creating your market',
        description: error,
      })
      return
    }

    toast({
      title: 'Your market has been created',
    })
  }

  const handleSubmit = form.handleSubmit(onSubmit)

  return (
    <Form {...form}>
      <form autoComplete="off" className="w-2/3 space-y-6" onSubmit={(e) => void handleSubmit(e)}>
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Input placeholder="Will bitcoin hit $76,543.21 by the end of 2024?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Provide a detailed description of the question" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="closeDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Close Date</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  {...field}
                  onChange={(e) => {
                    field.onChange(new Date(e.target.value))
                  }}
                  value={field.value ? moment(field.value).format('YYYY-MM-DDTHH:mm') : ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <p className="text-sm text-muted-foreground">
          Trading will stop at this time in your local timezone {tzName === null ? '' : `(${tzName})`}
        </p>
        <Button type="submit">Create</Button>
      </form>
    </Form>
  )
}
