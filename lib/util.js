function underline2Hump (str) {
  return str.replace(/_([a-zA-Z0-9])/g, function (_, p1) {
    return p1.toUpperCase()
  })
}

function toHorizontalLine (str) {
  return str.replace(/_([a-zA-Z0-9])/g, function (_, p1) {
    return `-${p1.toLowerCase()}`
  }).replace(/([A-Z])/g, function (_, p1) {
    return `-${p1.toLowerCase()}`
  })
}

function deepCopy (src, includeFunction = true) {
  const constructor = Object.getPrototypeOf(src).constructor
  if (constructor === Array) {
    return src.slice()
  }
  if (constructor === Object) {
    const dst = {}
    for (const key in src) {
      dst[key] = deepCopy(src[key])
    }
    return dst
  }
  if (constructor === Map) {
    return new Map(src)
  }
  if (constructor === Set) {
    return new Set(src)
  }
  if (constructor === Function && includeFunction) {
    return src
  }
  return JSON.parse(JSON.stringify(src))
}

exports.deepCopy = deepCopy
exports.underline2Hump = underline2Hump
exports.toHorizontalLine = toHorizontalLine
