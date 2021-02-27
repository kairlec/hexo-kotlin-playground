function parseHide (code) {
  const hideStart = /[^\n]*^\/{2,}\s*@hidestart[^\n]*$\n?/mg.exec(code)
  const hideEnd = /[^\n]*^\/{2,}\s*@hideend[^\n]*$\n?/mg.exec(code)
  if (hideStart && hideEnd) {
    return {
      prefix: code.substr(0, hideStart.index - 1),
      hidden: code.slice(hideStart.index + hideStart[0].length, hideEnd.index - 1),
      suffix: code.slice(hideEnd.index + hideEnd[0].length),
      ok: true
    }
  } else {
    return {
      code: code,
      ok: false
    }
  }
}

exports.parseHide = parseHide
