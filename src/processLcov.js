function processFile (fileText) {
  const lines = fileText.split(/[\n\r]+/)
  const summary = {
    DA: {}
  }
  for (const line of lines) {
    if (line === 'end_of_record') {
      continue
    }
    const match = line.match(/^([A-Z]+):(.*)/)
    if (!match) {
      throw new Error(`Couldn't parse line: ${line}`)
    }
    const [, type, data] = match
    switch (type) {
      case 'TN':
        // Do nothing
        break
      case 'SF':
        summary.src = data
        break
      case 'FNF':
        // Functions Found
      case 'FNH':
        // Functions Hit
      case 'LF':
        // Lines Found
      case 'LH':
        // Lines Hit
      case 'BRF':
        // Branches Found
      case 'BRH':
        // Branches Hit
      {
        summary[type] = parseInt(data, 10)
        break
      }
      case 'DA': {
        const [, lineNumberStr, hitCountStr] = data.match(/(\d+),(\d+)/)
        summary.DA[parseInt(lineNumberStr, 10)] = parseInt(hitCountStr, 10)
        break
      }
      case 'BRDA':
      case 'FN':
      case 'FNDA':
        // Figure out what to do with this later
        break
      default:
        throw new Error(`Unhandled type: ${type}`)
    }
  }
  return summary
}

export function processLcov (lcovReportText) {
  const fileSummaries = lcovReportText.match(/TN:[\S\s]+?end_of_record/g)
  return fileSummaries.map((fileText) => {
    return processFile(fileText)
  })
}
