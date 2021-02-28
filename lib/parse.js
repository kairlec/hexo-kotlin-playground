function parseHide (code, preHandler, hiddenHandler) {
  const hideStart = /[^\n]*^\/{2,}\s*@hidestart[^\n]*$\n?/mg.exec(code)
  const hideEnd = /[^\n]*^\/{2,}\s*@hideend[^\n]*$\n?/mg.exec(code)
  if (hideStart && hideEnd) {
    return preHandler(code.substr(0, hideStart.index - 1)) + hiddenHandler(preHandler(code.slice(hideStart.index + hideStart[0].length, hideEnd.index - 1))) + preHandler(code.slice(hideEnd.index + hideEnd[0].length))
  } else {
    return preHandler(code)
  }
}

exports.parseHide = parseHide
