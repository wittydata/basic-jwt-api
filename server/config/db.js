const mongoose = require('mongoose')

const { dbConnString } = require('./index')
const log = require('./log')

const pino = log.child({ path: 'config/db' })

// Set auto connect to retry every 1 second for 24 hours
mongoose.connect(dbConnString, {
  config: {
    autoIndex: false,
    reconnectTries: 60 * 60 * 24,
    reconnectInterval: 1000
  },
  useNewUrlParser: true
})
mongoose.connection
  .on('connected', () => {
    pino.info('Mongoose Connected')
  })
  .on('disconnected', () => {
    pino.info('Mongoose Disconnected')
  })
  .on('error', (err) => {
    pino.error('Mongoose connection error:', err)
  })

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    process.exit(0)
  })
})

module.exports = mongoose
