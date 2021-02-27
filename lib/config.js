const { toHorizontalLine, deepCopy } = require('./util')
const { registerSpecialKeyValue, getSpecialKeyValue, setSpecialKeyValue, getRealKey } = require('./SpecialKeyValue')

function makeSpecialConfigKey (srcKey, targetKey, setFunction, getFunction) {
  if (getFunction === undefined) {
    if (typeof targetKey === 'function') {
      registerSpecialKeyValue(toHorizontalLine(srcKey), srcKey, targetKey, setFunction)
    } else if (typeof targetKey === 'undefined') {
      registerSpecialKeyValue(toHorizontalLine(srcKey), srcKey, setFunction, getFunction)
    } else {
      registerSpecialKeyValue(toHorizontalLine(srcKey), targetKey, setFunction, getFunction)
    }
  } else {
    registerSpecialKeyValue(toHorizontalLine(srcKey), toHorizontalLine(targetKey), setFunction, getFunction)
  }
}

function parseAttribute (str, pre) {
  const config = new Config(pre)
  while (true) {
    // eslint-disable-next-line
    let result = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/.exec(str)
    if (result === null) {
      break
    }
    config.set(result[1], result[2] || result[3] || result[4])
    str = str.slice(result.index + result[0].length)
  }
  return config
}

function getCodeBlockConfig (sourceCode, pre) {
  // 获取第一行注释
  const firstLineIndex = sourceCode.indexOf('\n')
  if (firstLineIndex === -1) {
    return { config: new Config(pre), code: sourceCode }
  }
  const firstLine = sourceCode.slice(0, firstLineIndex)
  const comment = /^\s*\/{2,}@playground *(.*)$/m.exec(firstLine)
  if (comment !== null && comment[1].length > 0) {
    return { config: parseAttribute(comment[1], pre), code: sourceCode.slice(firstLineIndex + 1) }
  } else {
    return { config: new Config(pre), code: sourceCode }
  }
}

function __getRealKey (key) {
  return getRealKey(toHorizontalLine(key))
}

function Config (obj) {
  if (obj instanceof Config) {
    this.enabled = obj.enabled
    this.config = deepCopy(obj.config)
  } else {
    this.config = {}
    if (obj) {
      for (const key in obj) {
        this.set(__getRealKey(key), obj[key])
      }
      this.enabled = !!obj.enabled
    } else {
      this.enabled = true
    }
  }

  this.__set = function (key, value) {
    if (key === 'enabled') {
      if (typeof value === 'string') {
        this.enable(value.toLowerCase() !== 'false')
      } else {
        this.enable(value)
      }
    } else {
      this.config[key] = value
    }
  }

  this.__get = function (key) {
    return this.config[key]
  }

  this.set = function (key, ...value) {
    if (typeof key !== 'string') {
      throw TypeError('key type must be string')
    }
    let realValue
    for (const v of value) {
      if (v !== undefined) {
        realValue = v
        break
      }
    }
    setSpecialKeyValue(key, realValue, this.__set, this)
  }

  this.has = function (key) {
    return __getRealKey(key) in this.config
  }

  this.remove = function (key) {
    delete this.config[this.__getRealKey(key)]
  }

  this.get = function (key, defaultValue) {
    if (typeof key !== 'string') {
      throw TypeError('key type must be string')
    }
    const value = getSpecialKeyValue(key, this.__get, this)
    if (value === undefined) {
      return defaultValue
    } else {
      return value
    }
  }

  this.enable = function (enabled) {
    if (enabled === undefined) {
      this.enabled = true
    } else {
      this.enabled = !!enabled
    }
  }

  this.disable = function (disabled) {
    if (disabled === undefined) {
      this.enabled = false
    } else {
      this.enabled = !disabled
    }
  }

  this.toString = function (ifNull = (item) => ` ${item}`) {
    let str = ''
    for (const item in this.config) {
      if (this.config[item] === null) {
        str += ifNull(item)
      } else if (this.config[item] === undefined) {
        str += ` ${item}`
      } else {
        str += ` ${item}="${this.config[item]}"`
      }
    }
    return str
  }
}

exports.getCodeBlockConfig = getCodeBlockConfig
exports.makeSpecialConfigKey = makeSpecialConfigKey
exports.Config = Config
