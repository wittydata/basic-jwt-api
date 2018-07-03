const pino = require('pino')

const { appName, logLevel } = require('./index')

const isDev = process.env.NODE_ENV !== 'production'
const options = { name: appName, level: logLevel }
let pretty

if (isDev) {
  pretty = pino.pretty()
  pretty.pipe(process.stdout)
}

module.exports = pino(options, pretty)
