export const dynamic = 'force-dynamic'

export function GET(request: Request) {
  return new Response(`Pong. ${process.env.VERCEL_REGION}`)
}
