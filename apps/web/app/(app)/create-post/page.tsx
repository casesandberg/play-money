"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
 
import { Button } from "@play-money/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@play-money/ui/form"
import { Input } from "@play-money/ui/input"
import { Textarea } from "@play-money/ui/textarea"
import { toast } from "@play-money/ui/use-toast"
 
const FormSchema = z.object({
  question: z.string().min(1, "Question is required"),
  description: z.string(),
  closeDate: z.string().regex(
    /^\d{4}-\d{2}-\d{2}$/,
    "Invalid date format"
  ),
  closeTime: z.string().regex(
    /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    "Invalid time format"
  ),
})
 
export default function CreatePost() {
  return (
    <CreateBinaryMarketForm />
  );
}

function CreateBinaryMarketForm() {
  
  const tzName = new Date().toString().match(/\(([A-Za-z\s].*)\)/)?.[1] || "(unknown)";

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      question: "",
      description: "",
      closeDate: "",
      closeTime: "12:00",
    },
  })
 
  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data)
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
        <div className="flex w-full max-w-sm items-center space-x-2">
          <FormField
            control={form.control}
            name="closeDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Close Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="closeTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Close Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Trading will stop at this time in your local timezone ({tzName}).
        </p>
        <Button type="submit">Create</Button>
      </form>
    </Form>
  )
}