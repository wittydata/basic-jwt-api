const Router = require('koa-router')

const noteRouter = require('./note')
const permissionRouter = require('./permission')
const roleRouter = require('./role')
const userRouter = require('./user')

const router = new Router()

router
  .use('/notes', noteRouter.routes(), noteRouter.allowedMethods())
  .use('/permissions', permissionRouter.routes(), permissionRouter.allowedMethods())
  .use('/roles', roleRouter.routes(), roleRouter.allowedMethods())
  .use('/users', userRouter.routes(), userRouter.allowedMethods())

module.exports = router
