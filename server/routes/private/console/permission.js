const Router = require('koa-router')

const Permission = require('../../../models/permission')

const router = new Router()

router
  .get('/', async (ctx, next) => {
    const { state } = ctx
    const { user } = state
    const { role } = user
    const permissions = await Permission.find({ grants: role }, { action: 1 })
    ctx.body = { list: permissions.map(({ action }) => action) }
  })

module.exports = router
