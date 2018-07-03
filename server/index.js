const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const cors = require('@koa/cors')
const logger = require('koa-logger')

const { appName, port } = require('./config')
const db = require('./config/db')
const log = require('./config/log')
const sessionHandler = require('./middlewares/sessionHandler')
const routes = require('./routes')

const app = module.exports = new Koa()

db.Promise = global.Promise
app
  .use(bodyParser())
  .use(cors())
  .use(logger())
  .use(sessionHandler())
  .use(routes.routes())
  .use(routes.allowedMethods())
  .listen(port, () => log.info(appName, 'listening on port', port))
