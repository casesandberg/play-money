'use client'

import React from 'react'
import BaseSwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'
import docs from '../openapi.json'

// TODO: Replace with https://tailwindui.com/templates/protocol template

// function SidebarLayout({ getComponent }: { getComponent: (name: string, isOpenApi: boolean) => React.ReactNode }) {
//   const Operations = getComponent('operations', true)

//   return (
//     <div className="swagger-ui">
//       foo bar
//       <Operations />
//     </div>
//   )
// }

// const LayoutPlugin = () => {
//   return {
//     components: {
//       SidebarLayout,
//     },
//   }
// }

export function SwaggerUI() {
  return <BaseSwaggerUI spec={docs} tryItOutEnabled={false} />
}
