const Router = require('koa-router')

const apiRouter = require('./api')
const publicRouter = require('./public')

const router = new Router()

router
  .use('/api', apiRouter.routes(), apiRouter.allowedMethods())
  .use('/public/api', publicRouter.routes(), publicRouter.allowedMethods())

module.exports = router
