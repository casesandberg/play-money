'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { _UserModel } from '@play-money/database'
import { Button } from '@play-money/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@play-money/ui/form'
import { Input } from '@play-money/ui/input'
import { toast } from '@play-money/ui/use-toast'

const FormSchema = _UserModel.pick({ email: true })

type FormData = z.infer<typeof FormSchema>

export function RegisterForm() {
  const router = useRouter()
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    const { email } = data
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/register`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const { message } = await response.json()
        throw new Error(message || 'Network response was not ok')
      }

      const _json = await response.json()

      router.push('/login')
    } catch (error: any) {
      console.error('Registration Failed:', error)
      toast({ title: 'Registration Failed', description: error.message })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="Password" {...field} type="password" />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Create Account
        </Button>
      </form>
    </Form>
  )
}
