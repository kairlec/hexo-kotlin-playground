const specialKeyValueMap = new Map()

class SpecialKeyValue {
  constructor (targetKey, setFunction = function (value) { return value }, getFunction = function (value) { return value }) {
    this.targetKey = targetKey
    this.setFunction = setFunction
    this.getFunction = getFunction
  }
}

function registerSpecialKeyValue (srcKey, targetKey, setFunction, getFunction) {
  specialKeyValueMap.set(srcKey, new SpecialKeyValue(targetKey, setFunction, getFunction))
}

function getRealKey (key) {
  if (specialKeyValueMap.has(key)) {
    return getRealKey(specialKeyValueMap.get(key).targetKey)
  }
  return key
}

function getSpecialKeyValue (key, getValueFunction, applyTarget) {
  if (specialKeyValueMap.has(key)) {
    const special = specialKeyValueMap.get(key)
    return special.getFunction(getSpecialKeyValue(special.targetKey, getValueFunction, applyTarget))
  } else {
    return getValueFunction.apply(applyTarget, [key])
  }
}

function setSpecialKeyValue (key, value, setValueFunction, applyTarget) {
  if (specialKeyValueMap.has(key)) {
    const special = specialKeyValueMap.get(key)
    setSpecialKeyValue(special.targetKey, special.setFunction(value), setValueFunction, applyTarget)
  } else {
    setValueFunction.apply(applyTarget, [key, value])
  }
}

exports.registerSpecialKeyValue = registerSpecialKeyValue
exports.getSpecialKeyValue = getSpecialKeyValue
exports.setSpecialKeyValue = setSpecialKeyValue
exports.getRealKey = getRealKey
