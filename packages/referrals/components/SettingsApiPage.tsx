'use client'

import { format } from 'date-fns'
import { CopyIcon } from 'lucide-react'
import React from 'react'
import { ApiKey } from '@play-money/database'
import { Button } from '@play-money/ui/button'
import { Card, CardContent } from '@play-money/ui/card'
import { toast } from '@play-money/ui/use-toast'

export function SettingsApiPage({ keys, onCreateKey }: { keys: Array<ApiKey>; onCreateKey: () => Promise<void> }) {
  return (
    <div className="grid gap-8 ">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">API</h1>
          <p className="mt-2 text-muted-foreground">
            Include{' '}
            <code className="rounded bg-muted px-1 py-1 text-foreground">x-api-key: &#123;&#123;key&#125;&#125;</code>{' '}
            in the header of your requests.
          </p>
        </div>
        <Card className="bg-muted/50">
          <CardContent className="md:pt-6">
            <h2 className="text-xl font-bold">API Reference</h2>
            <div className="mt-4 flex items-center justify-between">
              <a className="text-lg font-medium underline" href={process.env.NEXT_PUBLIC_API_URL} target="_blank">
                {process.env.NEXT_PUBLIC_API_URL}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="md:pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Keys</h2>
            {!keys.length && (
              <Button
                size="sm"
                onClick={async () => {
                  try {
                    await onCreateKey()
                  } catch (error) {
                    console.error(error) // eslint-disable-line no-console -- ignore
                    toast({ title: 'Failed to create API key', variant: 'destructive' })
                  }
                }}
              >
                Create Key
              </Button>
            )}
          </div>
          {keys.length ? (
            <div className="mt-4 space-y-4">
              {keys.map((key) => (
                <div>
                  <div key={key.id} className="flex items-center justify-between">
                    <span>{key.key}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(key.key)
                      }}
                    >
                      <CopyIcon className="h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Created <time dateTime={key.createdAt.toString()}>{format(key.createdAt, 'MMM d, yyyy')}</time>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 space-y-4">No keys yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
