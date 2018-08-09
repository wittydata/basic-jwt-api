const pino = require('pino')

const { appName, logLevel } = require('./index')

const isDev = process.env.NODE_ENV === 'development'
const options = {
  level: logLevel,
  name: appName
}

if (isDev) {
  options.prettyPrint = { levelFirst: true }
}

module.exports = pino(options)
