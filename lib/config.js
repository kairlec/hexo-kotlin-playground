const {toHorizontalLine, deepCopy} = require('./util')
const {registerSpecialKeyValue, getSpecialKeyValue, setSpecialKeyValue, getRealKey} = require('./SpecialKeyValue')

function makeSpecialConfigKey(srcKey, targetKey, setFunction, getFunction) {
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

function parseAttribute(config, args) {
    args.forEach((arg) => {
        // eslint-disable-next-line
        let result = /^([^=]+)(?:=(.+))?$/.exec(arg)
        if (result !== null) {
            config.set(result[1].trim(), result[2].trim())
        } else {
            console.warn("unknown config format:", arg)
        }
    })
}

function getCodeBlockConfig(args, pre) {
    const config = new Config(pre)
    parseAttribute(config, args)
    return config
}

function __getRealKey(key) {
    return getRealKey(toHorizontalLine(key))
}

function Config(obj) {
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
        this.config[key] = value
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
            if (v !== undefined && v !== null) {
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
        delete this.config[__getRealKey(key)]
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
