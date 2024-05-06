import z from 'zod'

export class ServerError extends Error {
  constructor(message = 'There was an error on the server') {
    super(message)
    this.name = 'ServerError'
  }
}

export const ServerErrorSchema = z.object({ error: z.string() })
