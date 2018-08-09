const Router = require('koa-router')

const privateRouter = require('./private')
const publicRouter = require('./public')

const router = new Router()

router
  .use('/private/api', privateRouter.routes(), privateRouter.allowedMethods())
  .use('/api', publicRouter.routes(), publicRouter.allowedMethods())

module.exports = router
