'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { PopoverClose } from '@radix-ui/react-popover'
import _ from 'lodash'
import { ToggleLeftIcon, XIcon, CircleIcon, CircleDotIcon, PlusIcon } from 'lucide-react'
import moment from 'moment'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CirclePicker } from 'react-color'
import { useFieldArray, useForm } from 'react-hook-form'
import { mutate } from 'swr'
import { z } from 'zod'
import { createMarket, createMarketGenerateTags } from '@play-money/api-helpers/client'
import { MY_BALANCE_PATH } from '@play-money/api-helpers/client/hooks'
import { MarketSchema, MarketOptionSchema } from '@play-money/database'
import { CurrencyDisplay } from '@play-money/finance/components/CurrencyDisplay'
import { INITIAL_MARKET_LIQUIDITY_PRIMARY } from '@play-money/finance/economy'
import { Button } from '@play-money/ui/button'
import { Card } from '@play-money/ui/card'
import { Editor } from '@play-money/ui/editor'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@play-money/ui/form'
import { Input } from '@play-money/ui/input'
import { Label } from '@play-money/ui/label'
import { MultiSelect } from '@play-money/ui/multi-select'
import { Popover, PopoverContent, PopoverTrigger } from '@play-money/ui/popover'
import { RadioGroup, RadioGroupItem } from '@play-money/ui/radio-group'
import { toast } from '@play-money/ui/use-toast'
import { cn } from '@play-money/ui/utils'

const COLORS = [
  '#f44336',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',
  '#2196f3',
  '#03a9f4',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#8bc34a',
  '#cddc39',
  '#ffeb3b',
  '#ffc107',
  '#ff9800',
  '#ff5722',
  '#795548',
  '#9e9e9e',
  '#607d8b',
]

const marketCreateFormSchema = MarketSchema.pick({
  question: true,
  description: true,
  closeDate: true,
  tags: true,
}).and(
  z.object({
    options: z.array(MarketOptionSchema.pick({ name: true, color: true })),
    type: z.enum(['binary', 'multi']),
  })
)
type MarketCreateFormValues = z.infer<typeof marketCreateFormSchema>

export function CreateMarketForm({ onSuccess }: { onSuccess?: () => Promise<void> }) {
  const [SHUFFLED_COLORS] = useState(_.shuffle(COLORS))
  const router = useRouter()
  const tzName = /\((?<tz>[A-Za-z\s].*)\)/.exec(new Date().toString())?.groups?.tz ?? null

  const form = useForm<MarketCreateFormValues>({
    resolver: zodResolver(marketCreateFormSchema),
    defaultValues: {
      question: '',
      type: 'binary',
      description: '',
      closeDate: moment().add(1, 'month').endOf('day').toDate(),
      options: [
        { name: 'Yes', color: SHUFFLED_COLORS[0] },
        { name: 'No', color: SHUFFLED_COLORS[1] },
      ],
      tags: [],
    },
  })

  async function onSubmit(market: MarketCreateFormValues) {
    try {
      const newMarket = await createMarket(market)

      onSuccess?.()
      void mutate(MY_BALANCE_PATH)
      toast({
        title: 'Your market has been created',
      })
      router.push(`/questions/${newMarket.id}/${newMarket.slug}`)
    } catch (error) {
      toast({
        title: 'There was an error creating your market',
        description: (error as Error).message,
      })
    }
  }

  const handleSubmit = form.handleSubmit(onSubmit)

  const { fields, replace, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  })

  const type = form.watch('type')

  useEffect(
    function replaceOptionsIfMulti() {
      if (type === 'binary') {
        replace([
          { name: 'Yes', color: SHUFFLED_COLORS[0] },
          { name: 'No', color: SHUFFLED_COLORS[1] },
        ])
      } else if (type === 'multi') {
        replace([
          { name: '', color: SHUFFLED_COLORS[0] },
          { name: '', color: SHUFFLED_COLORS[1] },
          { name: '', color: SHUFFLED_COLORS[2] },
        ])
      }
    },
    [type]
  )

  async function handleQuestionBlur() {
    if (!form.getValues('tags')?.length) {
      const { tags } = await createMarketGenerateTags({ question: form.getValues('question') })
      form.setValue('tags', tags)
    }
  }

  return (
    <Card className="mx-auto flex max-w-screen-sm flex-1 p-6">
      <Form {...form}>
        <form autoComplete="off" className="flex-1 space-y-6" onSubmit={(e) => void handleSubmit(e)}>
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Market type</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-row gap-4">
                    <Card className="flex flex-row">
                      <FormItem
                        className={cn(
                          'm-0.5 flex w-40',
                          field.value === 'binary' && 'bg-primary/10 ring-2 ring-inset ring-primary'
                        )}
                      >
                        <FormControl>
                          <RadioGroupItem value="binary" className="hidden" />
                        </FormControl>
                        <FormLabel className="flex w-full cursor-pointer flex-col items-center justify-center p-2 pt-0">
                          <div className="flex h-6 items-center">
                            <ToggleLeftIcon className="size-6" />
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="text-base">Binary</div>
                            <div className="text-xs text-muted-foreground">Yes/no questions</div>
                          </div>
                        </FormLabel>
                      </FormItem>
                      <FormItem
                        className={cn(
                          'm-0.5 flex w-40',
                          field.value === 'multi' && 'bg-primary/10 ring-2 ring-inset ring-primary'
                        )}
                      >
                        <FormControl>
                          <RadioGroupItem value="multi" className="hidden" />
                        </FormControl>
                        <FormLabel className="flex w-full cursor-pointer flex-col items-center justify-center p-2 pt-0">
                          <div className="flex h-6 items-center">
                            <CircleIcon className="size-4 stroke-[3px]" />
                            <CircleDotIcon className="size-4 stroke-[3px]" />
                            <CircleIcon className="size-4 stroke-[3px]" />
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="text-base">Multiple choice</div>
                            <div className="text-xs text-muted-foreground">Many options</div>
                          </div>
                        </FormLabel>
                      </FormItem>
                    </Card>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="question"
            render={({ field: { onBlur, ...field } }) => (
              <FormItem>
                <FormLabel>Question</FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      type === 'binary'
                        ? 'Will bitcoin hit $76,543.21 by the end of 2024?'
                        : 'Who will win the 2024 US Presidential Election?'
                    }
                    onBlur={() => {
                      handleQuestionBlur()
                      onBlur()
                    }}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <Label>Options</Label>

            <Card className="divide-y">
              {fields.map((fieldItem, index) => (
                <div className="relative flex gap-1 p-2" key={fieldItem.id}>
                  {type === 'multi' && index > 2 ? (
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute -left-3 mt-2 size-6"
                      onClick={() => {
                        remove(index)
                      }}
                    >
                      <XIcon className="size-4" />
                    </Button>
                  ) : null}
                  <div className="ml-2 mt-2.5 w-8 text-sm font-medium text-muted-foreground">#{index + 1}</div>
                  <FormField
                    control={form.control}
                    name={`options.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder={
                              type === 'binary'
                                ? index === 0
                                  ? 'Yes'
                                  : 'No'
                                : index === 0
                                  ? 'Kamala Harris'
                                  : index === 1
                                    ? 'Donald Trump'
                                    : index === 2
                                      ? 'Nikki Haley'
                                      : ''
                            }
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`options.${index}.color`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button size="icon" variant="outline">
                                <div style={{ backgroundColor: field.value }} className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                              <PopoverClose>
                                <CirclePicker
                                  onChangeComplete={(color) => field.onChange(color.hex)}
                                  color={field.value}
                                />
                              </PopoverClose>
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </Card>

            {type === 'multi' ? (
              <Button
                variant="ghost"
                type="button"
                size="sm"
                disabled={fields.length >= 9}
                onClick={() => {
                  append({ name: '', color: SHUFFLED_COLORS[fields.length] })
                }}
              >
                <PlusIcon className="size-4" />
                Add option
              </Button>
            ) : null}
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field: { ref, ...field } }) => (
              <FormItem>
                <FormLabel>Resolution criteria</FormLabel>
                <FormControl>
                  <div className="min-h-[80px]">
                    <Editor
                      inputClassName="border text-sm p-3 min-h-[80px]"
                      placeholder={
                        type === 'binary'
                          ? 'Resolves to the price listed on coindesk at mightnight on Dec 31st.'
                          : 'Resolves to credible reporting on news sites such as CNN.'
                      }
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
            name="tags"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <MultiSelect
                    value={value?.map((v) => ({ value: v, label: v }))}
                    onChange={(values) => onChange(values?.map((v) => v.value))}
                    hideClearAllButton
                    {...field}
                  />
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
            Create for
            <CurrencyDisplay value={INITIAL_MARKET_LIQUIDITY_PRIMARY} />
          </Button>
        </form>
      </Form>
    </Card>
  )
}
