'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import React from 'react'
import { debounce } from 'lodash'

import { Button } from '@play-money/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@play-money/ui/form'
import { Input } from '@play-money/ui/input'
import { Textarea } from '@play-money/ui/textarea'
import { toast } from '@play-money/ui/use-toast'
import { _UserModel } from '@play-money/database'
import { useUser } from '../context/UserContext'

const profileFormSchema = _UserModel.pick({ username: true, bio: true, avatarUrl: true })
type ProfileFormValues = z.infer<typeof profileFormSchema>

// TODO: @casesandberg Generate this from OpenAPI schema
async function checkUsernameAvailability(username: string): Promise<{ available: boolean; message?: string }> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/users/check-username?username=${encodeURIComponent(username)}`
  )
  return await response.json()
}

export function SettingsProfileForm() {
  const { user } = useUser()
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      username: user?.username ?? '',
      bio: user?.bio ?? '',
    },
  })

  const {
    formState: { isSubmitting, isDirty, isValid },
  } = form

  async function onSubmit(data: ProfileFormValues) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/me`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })

    if (!response.ok || response.status >= 400) {
      const { message } = await response.json()
      toast({
        title: 'There was an error updating your profile',
        description: message,
      })
      return
    }

    toast({
      title: 'Your profile has been updated',
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          rules={{
            validate: debounce(
              async (value: string) => {
                const { available, message } = await checkUsernameAvailability(value)
                return available || message || 'There is an error with that username'
              },
              500,
              { leading: true }
            ),
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name. It can be your real name or a pseudonym.
              </FormDescription>
              <FormMessage /> {/* TODO: @casesandberg Figure out why the validate error isnt being displayed */}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field: { value, ...restField } }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about yourself"
                  className="resize-none"
                  value={value ?? ''}
                  {...restField}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={!isDirty || !isValid} loading={isSubmitting}>
          Update profile
        </Button>
      </form>
    </Form>
  )
}
