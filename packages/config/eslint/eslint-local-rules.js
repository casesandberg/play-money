module.exports = {
  'enforce-protection-of-sensitive-fields': {
    meta: {
      type: 'problem',
      docs: {
        description: 'disallow sensitive fields in NextResponse.json',
        category: 'Possible Errors',
      },
      schema: [], // no options
    },
    create: function (context) {
      return {
        CallExpression(node) {
          if (
            node.callee.object &&
            node.callee.object.name === 'NextResponse' &&
            node.callee.property.name === 'json'
          ) {
            let firstArg = node.arguments[0]
            if (firstArg && firstArg.type === 'Identifier') {
              const variable = context.getScope().variables.find((v) => v && v.name === firstArg.name)

              if (variable && variable.defs && variable.defs[0].node.init) {
                // Check the initialization of the variable
                const init = variable.defs[0].node.init

                if (init.type === 'AwaitExpression') {
                  if (init.argument.type === 'CallExpression') {
                    // This would be true if the await is awaiting a function call.
                    // Further inspection can be added here to check the specifics of the call
                    // For simplicity, let's say we just print something:
                    // console.log('Variable is initialized with an await on a function call.')
                  }

                  if (init.argument && init.argument.arguments[0] && init.argument.arguments[0].properties) {
                    init.argument.arguments[0].properties.forEach((prop) => {
                      if (prop.key && prop.key.name === 'email') {
                        context.report({
                          node: prop,
                          message: "Sensitive field 'email' should not be returned in NextResponse.json",
                        })
                      }
                    })
                  }
                }

                if (init.type === 'ObjectExpression') {
                  // It's an object literal, check properties
                  init.properties.forEach((prop) => {
                    if (prop.key && prop.key.name === 'email') {
                      context.report({
                        node: prop,
                        message: "Sensitive field 'email' should not be returned in NextResponse.json",
                      })
                    }
                  })
                }
              }
            }
            if (firstArg && firstArg.type === 'ObjectExpression') {
              firstArg.properties.forEach((prop) => {
                if (prop.key && prop.key.name === 'email') {
                  context.report({
                    node: prop,
                    message: "Sensitive field 'email' should not be returned in NextResponse.json",
                  })
                }
              })
            }
          }
        },
      }
    },
  },
}
