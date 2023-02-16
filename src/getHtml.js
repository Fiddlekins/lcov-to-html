function getStyles () {
  return `
body {
  font-family: system-ui;
}
.tab-space {
  display: inline-block;
  width: 6px;
}
.red {
  background-color: #ff8989;
}
table {
  border-spacing: 0;
}
td {
  padding-right: 50px;
}
.monospace {
  font-family: monospace;
}
`
}

function getTabSpaceElement () {
  return '<span class="tab-space"></span>'
}

function convertWhitespace (text) {
  let textConverted = text
  textConverted = textConverted.replace(/^ +/g, ($0) => {
    return $0.split('').map(() => {return getTabSpaceElement()}).join('')
  })
  textConverted = textConverted.replace(/\t/g, getTabSpaceElement())
  return textConverted
}

function getTableHtml (tableData) {
  const headers = tableData[0]
  const rows = tableData.slice(1)
  let html = ''
  html += `<table>`
  html += `<tr class="${headers.classes?.join(' ') || ''}">`
  for (const header of headers.cells) {
    html += `<th>${header.value}</th>`
  }
  html += `</tr>`
  for (const row of rows) {
    html += `<tr class="${row.classes?.join(' ') || ''}">`
    for (const cell of row.cells) {
      html += `<td class="${cell.classes?.join(' ') || ''}">${cell.value}</td>`
    }
    html += `</tr>`
  }
  html += `</table>`
  return html
}

async function processFile (loadSrc, fileSummary) {
  const srcText = await loadSrc(fileSummary.src)
  const srcLines = srcText.split(/\n\r|\r\n|\n|\r/)
  const tableData = []
  const headers = {
    cells: [
      { value: 'Line Number' },
      { value: 'Hit Count' },
      { value: 'Line' }
    ]
  }
  tableData.push(headers)
  for (let lineIndex = 0; lineIndex < srcLines.length; lineIndex++) {
    const lineNumber = lineIndex + 1
    const row = {
      classes: [],
      cells: [
        { value: lineNumber },
        { value: typeof fileSummary.DA[lineNumber] === 'number' ? fileSummary.DA[lineNumber] : '' },
        { value: convertWhitespace(srcLines[lineIndex]), classes: ['monospace'] },
      ]
    }
    if (fileSummary.DA[lineNumber] === 0) {
      row.classes.push('red')
    }
    tableData.push(row)
  }
  return `<div>
<h2>${fileSummary.src}</h2>
<!--<div>${getSummary([fileSummary])}</div>-->
<details>
    <summary>Source</summary>
    <div>${getTableHtml(tableData)}</div>
</details>
</div>`
}

function getSummary (lcov) {
  const tableData = []
  const headers = {
    cells: [
      { value: 'File' },
      { value: 'Lines' },
      { value: 'Branches' },
      { value: 'Functions' }
    ]
  }
  tableData.push(headers)
  for (const fileSummary of lcov) {
    const row = {
      classes: [],
      cells: [
        { value: fileSummary.src },
        { value: `${fileSummary.LH}/${fileSummary.LF}`, classes: [fileSummary.LH !== fileSummary.LF ? 'red' : ''] },
        { value: `${fileSummary.BRH}/${fileSummary.BRF}`, classes: [fileSummary.BRH !== fileSummary.BRF ? 'red' : ''] },
        { value: `${fileSummary.FNH}/${fileSummary.FNF}`, classes: [fileSummary.FNH !== fileSummary.FNF ? 'red' : ''] },
      ]
    }
    tableData.push(row)
  }

  return getTableHtml(tableData)
}

export async function getHtml (loadSrc, lcov) {
  const content = (await Promise.all(lcov.map((fileSummary) => {
    return processFile(loadSrc, fileSummary)
  }))).join('\n')
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Coverage Report</title>
    <style>${getStyles()}</style>
</head>
<body>
${getSummary(lcov)}
${content}
</body>
</html>
`
}
