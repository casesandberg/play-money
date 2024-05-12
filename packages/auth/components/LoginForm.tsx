'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Sparkles } from 'lucide-react'
import { signIn } from 'next-auth/react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { _UserModel } from '@play-money/database'
import { Alert, AlertDescription } from '@play-money/ui/alert'
import { Button } from '@play-money/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@play-money/ui/form'
import { Input } from '@play-money/ui/input'
import { toast } from '@play-money/ui/use-toast'

const FormSchema = _UserModel.pick({ email: true })

type FormData = z.infer<typeof FormSchema>

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    const { email } = data

    try {
      setIsLoading(true)
      await signIn('resend', { email, callbackUrl: '/' })
    } catch (error: any) {
      console.error('Login Failed:', error)
      toast({ title: 'There was an issue signing you in', description: 'Please try again later' })
    } finally {
      setIsLoading(false)
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

        <Button type="submit" className="w-full" loading={isLoading}>
          Sign in with email
        </Button>
      </form>

      <Alert variant="muted">
        <Sparkles className="h-4 w-4" />
        <div />
        <AlertDescription>We will email you a magic link for a password-free sign in.</AlertDescription>
      </Alert>
    </Form>
  )
}
