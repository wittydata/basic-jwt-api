const uid = require('uid-safe')

const { npm_package_name: appName, NODE_ENV, PORT } = process.env
const isDev = NODE_ENV !== 'production'
const port = parseInt(PORT, 10) || 3000
const dbConnString = isDev
  ? 'mongodb://localhost:27017/basic-jwt-dev'
  : 'mongodb://localhost:27017/basic-jwt'
const hostname = isDev ? `http://localhost:${port}` : 'http://api.domain.com'
const logLevel = isDev ? 'trace' : 'info'
const secretKey = isDev ? 'my.domain' : uid.sync(24)
const session = {
  // Session expires in 1 hour
  expiry: 60 * 60,
  // Remember Me expires in 1 day
  rememberMeExpiry: 60 * 60 * 24
}
const token = {
  // Token expires in 12 minutes
  expiry: 60 * 12,
  key: secretKey
}

module.exports = {
  appName,
  dbConnString,
  hostname,
  logLevel,
  port,
  session,
  token
}
