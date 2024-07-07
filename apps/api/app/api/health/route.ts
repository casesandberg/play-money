import { NextResponse } from 'next/server'
import os from 'node:os'
import db from '@play-money/database'

export async function GET() {
  const startTime = Date.now()
  const downstreamServices: Record<string, 'OK' | 'FAIL'> = {}
  const healthCheck = {
    message: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    databaseStatus: 'OK',
    databaseResponseTime: Infinity,
    responseTime: Infinity,
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    freeMemory: os.freemem(),
    totalMemory: os.totalmem(),
    downstreamServices,
  }

  try {
    // Check database connection and response time
    const dbStartTime = Date.now()
    await db.$queryRaw`SELECT 1`
    healthCheck.databaseResponseTime = Date.now() - dbStartTime

    // Check downstream services
    const downstreamServiceList = [{ name: 'Resend', url: 'https://api.resend.com' }]

    await Promise.all(
      downstreamServiceList.map(async (service) => {
        try {
          const response = await fetch(service.url, { signal: AbortSignal.timeout(5000) })
          healthCheck.downstreamServices[service.name] = response.status === 200 ? 'OK' : 'FAIL'
        } catch (error) {
          healthCheck.downstreamServices[service.name] = 'FAIL'
        }
      })
    )

    healthCheck.responseTime = Date.now() - startTime

    return NextResponse.json(healthCheck)
  } catch (error) {
    console.error('Health check failed:', error) // eslint-disable-line no-console -- Log error to console
    return NextResponse.json(healthCheck, { status: 500 })
  } finally {
    await db.$disconnect()
  }
}
