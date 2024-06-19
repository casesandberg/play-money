const { exec } = require('child_process')
const path = require('path')

// Get the script name from the arguments
const scriptName = process.argv[2]

if (!scriptName) {
  console.error('Please provide a script name as an argument.')
  process.exit(1)
}

// Construct the path to the TypeScript script
const scriptPath = path.join(__dirname, `${scriptName}.ts`)

// Run the TypeScript script using ts-node
exec(`tsx ${scriptPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing script: ${error.message}`)
    return
  }
  if (stderr) {
    console.error(`Script stderr: ${stderr}`)
    return
  }
  console.log(`Script stdout: ${stdout}`)
})
