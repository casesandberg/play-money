'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import moment from 'moment'
import { useRouter } from 'next/navigation'
import { useFieldArray, useForm } from 'react-hook-form'
import { useSWRConfig } from 'swr'
import { z } from 'zod'
import { CurrencyDisplay } from '@play-money/currencies/components/CurrencyDisplay'
import type { Market } from '@play-money/database'
import { MarketSchema, MarketOptionSchema } from '@play-money/database'
import { INITIAL_MARKET_LIQUIDITY_PRIMARY } from '@play-money/economy'
import { Button } from '@play-money/ui/button'
import { Card } from '@play-money/ui/card'
import { Editor } from '@play-money/ui/editor'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@play-money/ui/form'
import { Input } from '@play-money/ui/input'
import { Label } from '@play-money/ui/label'
import { toast } from '@play-money/ui/use-toast'

const marketCreateFormSchema = MarketSchema.pick({ question: true, description: true, closeDate: true }).and(
  z.object({ options: z.array(MarketOptionSchema.pick({ name: true, currencyCode: true })) })
)
type MarketCreateFormValues = z.infer<typeof marketCreateFormSchema>

export default function CreatePost() {
  return <CreateBinaryMarketForm />
}

function CreateBinaryMarketForm() {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const tzName = /\((?<tz>[A-Za-z\s].*)\)/.exec(new Date().toString())?.groups?.tz ?? null

  const form = useForm<MarketCreateFormValues>({
    resolver: zodResolver(marketCreateFormSchema),
    defaultValues: {
      question: '',
      description: '',
      closeDate: moment().add(1, 'month').endOf('day').toDate(),
      options: [
        { name: 'Yes', currencyCode: 'YES' },
        { name: 'No', currencyCode: 'NO' },
      ],
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

    const newMarket = (await response.json()) as Market

    void mutate('/v1/users/me/balance')
    toast({
      title: 'Your market has been created',
    })
    router.push(`/questions/${newMarket.id}/${newMarket.slug}`)
  }

  const handleSubmit = form.handleSubmit(onSubmit)

  const { fields } = useFieldArray({
    control: form.control,
    name: 'options',
  })

  return (
    <Card className="mx-auto flex max-w-screen-sm flex-1 p-6">
      <Form {...form}>
        <form autoComplete="off" className="flex-1 space-y-6" onSubmit={(e) => void handleSubmit(e)}>
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

          <div className="space-y-2">
            <Label>Options</Label>

            <div className="-space-y-px">
              {fields.map((fieldItem, index) => (
                <FormField
                  control={form.control}
                  key={fieldItem.currencyCode}
                  name={`options.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input placeholder={fieldItem.currencyCode === 'YES' ? 'Yes' : 'No'} {...field} />

                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground opacity-50">
                            {fieldItem.currencyCode === 'YES' ? 'Resolves yes' : 'Resolves no'}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resolution criteria</FormLabel>
                <FormControl>
                  <div className="min-h-[80px]">
                    <Editor
                      inputClassName="border text-sm p-3 min-h-[80px]"
                      placeholder="Resolves to the price listed on coindesk at mightnight on Dec 31st."
                      {...field}
                    />
                  </div>
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
                    className="w-auto"
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
          <Button loading={form.formState.isSubmitting} type="submit">
            Create for{' '}
            <CurrencyDisplay className="ml-2" currencyCode="PRIMARY" value={INITIAL_MARKET_LIQUIDITY_PRIMARY} />
          </Button>
        </form>
      </Form>
    </Card>
  )
}
