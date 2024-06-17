import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'
import { getApiDocs } from '../lib/openAPI'

export default async function IndexPage() {
  const spec = await getApiDocs()
  return (
    <section className="container">
      <SwaggerUI spec={spec} />
    </section>
  )
}
