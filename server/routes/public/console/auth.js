const jwt = require('jsonwebtoken')
const uid = require('uid-safe')
const Router = require('koa-router')

const { session, token } = require('../../../config')
const formatter = require('../../../util/formatter')
const Permission = require('../../../models/permission')
const Session = require('../../../models/session')
const User = require('../../../models/user')
const UserError = require('../../../models/user/error')

const router = new Router()
const { expiry: sessionExpiry } = session
const { expiry: tokenExpiry, key: tokenKey } = token

router
  .post('/login', async (ctx, next) => {
    const { ip, request } = ctx
    const { body } = request
    const { email, password, newPassword, rememberMe = false } = body
    const user = await User.findOne({ email: `${email}` })
    const { active } = user || {}
    ctx.status = 400
    ctx.body = {
      valid: false,
      errors: [UserError.INVALID_CREDENTIALS]
    }

    if (active === true) {
      let { _id, name, role, resetPassword } = user

      if (user.verifyPassword(email, password)) {
        if (resetPassword && newPassword) {
          const salt = uid.sync(24)
          const result = await User.update({ _id }, {
            $set: {
              resetPassword: false,
              password: User.encryptPassword(newPassword, salt),
              salt
            }
          })

          if (result.nModified > 0) {
            resetPassword = false
          } else {
            return
          }
        }

        const permissions = await Permission.find({ grants: role }, { action: 1 })
        const token = jwt.sign({ _id }, tokenKey, { expiresIn: tokenExpiry })
        await Session.create({
          expiredAt: new Date(Date.now() + sessionExpiry * 1000),
          rememberMe,
          token,
          userId: _id,
          userIp: ip
        })
        ctx.status = 200
        ctx.body = {
          permissions: permissions.map(({ action }) => action),
          resetPassword,
          token,
          user: { name }
        }
      }
    }
  })
  .post('/logout', async (ctx, next) => {
    const { request } = ctx
    const { body } = request
    const { token } = body
    await Session.remove({ token: `${token}` })
    ctx.body = {}
  })
  .post('/reset-password', async (ctx, next) => {
    const { request } = ctx
    const { body } = request
    const { email } = body
    const user = await User.findOne({ email: `${email}` }, { email: 1, active: 1 })
    const { active } = user || {}
    ctx.status = 400
    ctx.body = {
      valid: false,
      errors: [User.NOT_EXISTS]
    }

    if (active === true) {
      const { _id, email } = user

      // const password = User.generatePassword()
      const password = 'Test1234'
      const salt = uid.sync(24)
      const result = await User.update({ _id }, {
        $set: {
          resetPassword: true,
          password: User.encryptPassword(password, salt),
          salt
        }
      })

      if (result.nModified > 0) {
        // Send new temporary password e-mail
      }

      ctx.status = 200
      ctx.body = { email: formatter.obfuscateEmail(email) }
    }
  })

module.exports = router
