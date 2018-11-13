const jwt = require('jsonwebtoken')

const { session, token } = require('../config')
const Permission = require('../models/permission')
const Session = require('../models/session')
const User = require('../models/user')

const { expiry: sessionExpiry, rememberMeExpiry } = session
const { expiry: tokenExpiry, key: tokenKey } = token
const sessionExpiryInMillis = sessionExpiry * 1000
const rememberMeExpiryInMillis = rememberMeExpiry * 1000

function SessionHandler () {
  return async (ctx, next) => {
    const { header, ip, url } = ctx

    // Remove all outdated sessions
    let expiredAt = new Date(Date.now() - sessionExpiryInMillis)
    Session.deleteMany({ expiredAt: { $lte: expiredAt }, rememberMe: false }).exec()
    expiredAt = new Date(Date.now() - rememberMeExpiryInMillis)
    Session.deleteMany({ expiredAt: { $lte: expiredAt }, rememberMe: true }).exec()

    // Access to private API or contents
    if (url.startsWith('/private')) {
      const { authorization } = header

      if (authorization) {
        const [scheme, token] = authorization.split(' ')

        if (scheme === 'Bearer') {
          const session = await Session.findOne({
            $or: [{ token: `${token}` }, { lastToken: `${token}` }],
            userIp: ip
          })

          if (session) {
            const { _id, expiredAt, rememberMe, token, userId } = session
            const user = await User.findOne({ _id: userId }, { password: 0, salt: 0 })

            if (user) {
              const { role, active } = user

              if (active === true) {
                const sessionExpired = new Date(expiredAt).valueOf() - Date.now() < 0

                if (rememberMe || !sessionExpired) {
                  try {
                    const permissions = await Permission.find({ grants: role }, { action: 1 })
                    jwt.verify(token, tokenKey)
                    ctx.state.permissions = permissions.map(({ action }) => action)
                    ctx.state.user = user.toJSON()
                    return next()
                  } catch (err) {
                    if (err.name === 'TokenExpiredError') {
                      if (rememberMe && sessionExpired) {
                        // Extend session expiry
                        Session.updateOne({ _id }, { expiredAt: new Date(Date.now() + sessionExpiry * 1000) }).exec()
                      }

                      try {
                        jwt.verify(token, tokenKey)
                        // Refresh token
                        ctx.status = 401
                        ctx.body = { tokenRefreshed: true, token }
                        return
                      } catch (err) {
                        if (err.name === 'TokenExpiredError') {
                          const newToken = jwt.sign({ _id: userId }, tokenKey, { expiresIn: tokenExpiry })
                          Session.updateOne({ _id }, { token: newToken, lastToken: token, updatedAt: new Date() }).exec()
                          // Refresh token
                          ctx.status = 401
                          ctx.body = { tokenRefreshed: true, token: newToken }
                          return
                        }
                      }
                    }
                  }
                }

                // Session or token expired
                Session.deleteOne({ $or: [{ token }, { lastToken: token }] }).exec()
                ctx.status = 401
                ctx.body = { tokenExpired: true }
                return
              }
            }
          }

          // Invalid session or token
          ctx.status = 401
          ctx.body = { tokenRevoked: true }
          return
        }
      }

      // Unauthorized access
      ctx.status = 401
      ctx.body = { unauthorized: true }
    } else {
      return next()
    }
  }
}

module.exports = SessionHandler
