import fs from 'fs/promises'
import path from 'path'
import { getHtml } from './getHtml.js'
import { processLcov } from './processLcov.js'

async function main () {
  const [, , inputPathRaw] = process.argv
  const inputPath = path.isAbsolute(inputPathRaw) ? inputPathRaw : path.join(process.cwd(), inputPathRaw)
  const basePath = path.resolve(inputPath, '..')
  const outputPath = path.join(basePath, 'lcov.html')

  const loadSrc = (src) => {
    return fs.readFile(path.join(basePath, src), 'utf8')
  }

  const lcovReportText = await fs.readFile(inputPath, 'utf8')
  const lcov = processLcov(lcovReportText)
  const html = await getHtml(loadSrc, lcov)
  await fs.writeFile(outputPath, html, 'utf8')
}

main().catch(console.error)
