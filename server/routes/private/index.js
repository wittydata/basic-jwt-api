const Router = require('koa-router')

const consoleRouter = require('./console')

const router = new Router()

router
  .use(consoleRouter.routes(), consoleRouter.allowedMethods())

module.exports = router
