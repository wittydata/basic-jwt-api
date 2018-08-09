const uid = require('uid-safe')
const Router = require('koa-router')

const auth = require('../../../util/auth')
const User = require('../../../models/user')

const router = new Router()

router
  .get('/', async (ctx, next) => {
    const { state } = ctx
    const { permissions } = state
    ctx.status = 401
    ctx.body = { unauthorized: true }

    if (auth.canPerform('listUsers', permissions)) {
      ctx.status = 200
      ctx.body = await User.find({}, { name: 1, email: 1, role: 1, active: 1 }).sort({ role: 1, name: 1, email: 1 })
    }
  })
  .post('/', async (ctx, next) => {
    const { state } = ctx
    const { permissions } = state
    ctx.status = 401
    ctx.body = { unauthorized: true }

    if (auth.canPerform('createUser', permissions)) {
      const { request } = ctx
      const { body } = request
      const user = new User(body)
      const result = user.validateSync()
      ctx.status = 400

      if (result) {
        const { message } = result
        ctx.body = { message }
      } else {
        const { password } = body
        const newPassword = password || User.generatePassword()
        const salt = uid.sync(24)
        user.password = User.encryptPassword(newPassword, salt)
        user.salt = salt
        const result = await user.save()
        ctx.status = 201
        ctx.body = { _id: result._id }
      }
    }
  })
  .get('/:id', async (ctx, next) => {
    const { state } = ctx
    const { permissions } = state
    ctx.status = 401
    ctx.body = { unauthorized: true }

    if (auth.canPerform('readUser', permissions)) {
      const { params } = ctx
      const { id } = params
      ctx.body = {}

      if (await User.countDocuments({ _id: id }) > 0) {
        ctx.body = await User.findById(id, { name: 1, email: 1, role: 1, active: 1 })
      }
    }
  })
  .put('/:id', async (ctx, next) => {
    const { state } = ctx
    const { permissions } = state
    ctx.status = 401
    ctx.body = { unauthorized: true }

    if (auth.canPerform('updateUser', permissions)) {
      const { params, request } = ctx
      const { id } = params
      ctx.body = {}

      if (await User.countDocuments({ _id: id }) > 0) {
        const { body } = request
        const user = new User(body)
        const result = user.validateSync()
        ctx.status = 400

        if (result) {
          const { message } = result
          ctx.body = { message }
        } else {
          const { password } = body

          console.log(111, password)

          if (password) {
            const salt = uid.sync(24)
            body.password = User.encryptPassword(password, salt)
            body.salt = salt
          }

          const result = await User.update({ _id: id }, { $set: body })

          if (result.nModified > 0) {
            ctx.status = 200
            ctx.body = { _id: id }
          }
        }
      }
    }
  })
  .del('/:id', async (ctx, next) => {
    const { state } = ctx
    const { permissions } = state
    ctx.status = 401
    ctx.body = { unauthorized: true }

    if (auth.canPerform('deleteUser', permissions)) {
      const { params } = ctx
      const { id } = params
      ctx.body = {}

      if (await User.countDocuments({ _id: id }) > 0) {
        const result = await User.findByIdAndRemove(id)
        ctx.status = 400

        if (result) {
          ctx.status = 200
          ctx.body = { _id: result._id }
        }
      }
    }
  })
  .get('/check/:email', async (ctx, next) => {
    const { state } = ctx
    const { permissions } = state
    ctx.status = 401
    ctx.body = { unauthorized: true }

    if (auth.canPerform(['createUser', 'updateUser'], permissions)) {
      const { params } = ctx
      const { email } = params
      const result = await User.findOne({ email: `${email}` }, { _id: 1 })
      ctx.body = { exists: true }

      if (!result) {
        ctx.status = 200
        ctx.body = { exists: false }
      }
    }
  })

module.exports = router
