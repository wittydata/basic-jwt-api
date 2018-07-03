const Router = require('koa-router')

const auth = require('../../../util/auth')
const Role = require('../../../models/role')

const router = new Router()

router
  .get(['/find', '/find/:text'], async (ctx, next) => {
    const { state } = ctx
    const { permissions } = state
    ctx.status = 401
    ctx.body = { unauthorized: true }

    if (auth.canPerform(['createUser', 'updateUser'], permissions)) {
      const { params } = ctx
      const { text } = params
      const criteria = typeof text === 'string' ? { name: { $regex: text, $options: 'i' } } : {}
      criteria.active = true
      ctx.status = 200
      ctx.body = await Role.find(criteria, { name: 1 }).sort({ name: 1 })
    }
  })

module.exports = router
