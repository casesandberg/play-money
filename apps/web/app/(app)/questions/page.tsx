import Link from 'next/link'
import React from 'react'
import db from '@play-money/database'

export default async function AppQuestionsPage() {
  // TODO: @casesandberg Extract to API call

  const markets = await db.market.findMany({
    orderBy: [
      {
        createdAt: 'desc',
      },
    ],
  })

  return (
    <div>
      <h1>Questions</h1>

      <div className="space-y-4">
        {markets.map((market) => {
          return (
            <div className="border" key={market.id}>
              <Link className="block p-4" href={`/questions/${market.id}/${market.slug}`}>
                {market.question}
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
