function parseHide (code, hideStartReplace = '', hideEndReplace = '') {
  return code.replace(/^[ \t]*\/{2,}\s*@hidestart[ \t]*$\n?/img, hideStartReplace).replace(/^[ \t]*\/{2,}\s*@hideend[ \t]*$\n?/img, hideEndReplace)
}

exports.parseHide = parseHide
