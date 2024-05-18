"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { _MarketModel } from '@play-money/database'
import moment from "moment"
import { toast } from '@play-money/ui/use-toast'

import { Button } from "@play-money/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@play-money/ui/form"
import { Input } from "@play-money/ui/input"
import { Textarea } from "@play-money/ui/textarea"
 
const marketCreateFormSchema = _MarketModel.pick({ question: true, description: true, closeDate: true })
type marketCreateFormValues = z.infer<typeof marketCreateFormSchema>
 
export default function CreatePost() {
  return (
    <CreateBinaryMarketForm />
  );
}

function CreateBinaryMarketForm() {
  
  const tzName = new Date().toString().match(/\(([A-Za-z\s].*)\)/)?.[1] || "(unknown)";

  const form = useForm<marketCreateFormValues>({
    resolver: zodResolver(marketCreateFormSchema),
    defaultValues: {
      question: "",
      description: "",
      closeDate: moment().add(1, "month").endOf("day").toDate(),
    },
  })
 
  async function onSubmit(data: marketCreateFormValues) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/market`, {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include',
    })

    if (!response.ok || response.status >= 400) {
      const { error } = await response.json()
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
 
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
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
                  value={field.value ? moment(field.value).format("YYYY-MM-DDTHH:mm") : ""}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <p className="text-sm text-muted-foreground">
          Trading will stop at this time in your local timezone ({tzName}).
        </p>
        <Button type="submit">Create</Button>
      </form>
    </Form>
  )
}