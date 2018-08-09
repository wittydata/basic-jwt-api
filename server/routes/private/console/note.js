const Router = require('koa-router')

const auth = require('../../../util/auth')
const Note = require('../../../models/note')

const router = new Router()

router
  .get('/', async (ctx, next) => {
    const { state } = ctx
    const { permissions } = state
    ctx.status = 401
    ctx.body = { unauthorized: true }

    if (auth.canPerform('listNotes', permissions)) {
      ctx.body = await Note.find().sort({ updatedAt: -1, createdAt: -1, title: 1 })
    }
  })
  .post('/', async (ctx, next) => {
    const { state } = ctx
    const { permissions, user } = state
    ctx.status = 401
    ctx.body = { unauthorized: true }

    if (auth.canPerform('createNote', permissions)) {
      const { request } = ctx
      const { body } = request
      const note = new Note(body)
      const result = note.validateSync()
      ctx.status = 400

      if (result) {
        const { message } = result
        ctx.body = { message }
      } else {
        const { _id } = user
        note.createdBy = _id
        const result = await note.save()
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

    if (auth.canPerform('readNote', permissions)) {
      const { params } = ctx
      const { id } = params
      ctx.body = {}

      if (await Note.countDocuments({ _id: id }) > 0) {
        ctx.body = await Note.findById(id)
      }
    }
  })
  .put('/:id', async (ctx, next) => {
    const { state } = ctx
    const { permissions, user } = state
    ctx.status = 401
    ctx.body = { unauthorized: true }

    if (auth.canPerform('updateNote', permissions)) {
      const { params, request } = ctx
      const { id } = params
      ctx.body = {}

      if (await Note.countDocuments({ _id: id }) > 0) {
        const { body } = request
        const note = new Note(body)
        const result = note.validateSync()
        ctx.status = 400

        if (result) {
          const { message } = result
          ctx.body = { message }
        } else {
          const { _id } = user
          body.updatedAt = new Date()
          body.updatedBy = _id
          const result = await Note.update({ _id: id }, { $set: body })

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

    if (auth.canPerform('deleteNote', permissions)) {
      const { params } = ctx
      const { id } = params
      ctx.body = {}

      if (await Note.countDocuments({ _id: id }) > 0) {
        const result = await Note.findByIdAndRemove(id)
        ctx.status = 400

        if (result) {
          ctx.status = 200
          ctx.body = { _id: result._id }
        }
      }
    }
  })

module.exports = router
