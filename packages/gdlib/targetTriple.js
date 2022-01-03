import { execa } from 'execa'
import { promises as fs } from 'fs'

let extension = ''
if (process.platform === 'win32') {
  extension = '.exe'
}

async function main() {
  const rustInfo = (await execa('rustc', ['-vV'])).stdout
  const targetTriple = /host: (\S+)/g.exec(rustInfo)[1]
  if (!targetTriple) {
    console.error('Failed to determine platform target triple')
  }
  await fs.rename(
    `./build/gdlib${extension}`,
    `./build/gdlib-${targetTriple}${extension}`
  )
}

main().catch((e) => {
  throw e
})