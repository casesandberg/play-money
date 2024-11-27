import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'
import docs from '../openapi.json'

export const dynamic = 'force-dynamic'

export default function IndexPage() {
  return (
    <section className="container">
      <SwaggerUI spec={docs} />
    </section>
  )
}
