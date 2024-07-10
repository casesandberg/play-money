const RealDate = Date
const realMethods = { ...RealDate.prototype }
let now
let locale

function MockDate() {
  if (arguments.length === 0 && now != null) {
    return new RealDate(now)
  } else {
    return new RealDate(...arguments)
  }
}

MockDate.prototype = RealDate.prototype

const methodOverrides = {
  toLocaleString(locales, options) {
    return super.toLocaleString(locales ?? locale, options)
  },

  toLocaleTimeString(locales, options) {
    return super.toLocaleTimeString(locales ?? locale, options)
  },

  toLocaleDateString(locales, options) {
    return super.toLocaleDateString(locales ?? locale, options)
  },
}

MockDate.UTC = RealDate.UTC

MockDate.now = function () {
  return new MockDate().valueOf()
}

MockDate.parse = function (dateString) {
  return RealDate.parse(dateString)
}

MockDate.toString = function () {
  return RealDate.toString()
}

export function set(date) {
  var dateObj = new RealDate(date)
  if (isNaN(dateObj.getTime())) {
    throw new TypeError('mockdate: The time set is an invalid date: ' + date)
  }

  Date = MockDate
  Object.assign(Date.prototype, methodOverrides)

  now = dateObj.valueOf()
}

export function setLocale(localeStr) {
  Date = MockDate
  Object.assign(Date.prototype, methodOverrides)

  locale = localeStr
}

export function reset() {
  Date = RealDate
  Object.assign(Date.prototype, realMethods)

  now = undefined
  locale = undefined
}

export default {
  set,
  setLocale,
  reset,
}
