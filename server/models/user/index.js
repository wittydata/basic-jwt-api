const crypto = require('crypto')
const mongoose = require('mongoose')
const randomize = require('randomatic')
const uid = require('uid-safe')

const Schema = mongoose.Schema

const schema = new Schema({
  name: {
    type: String,
    minlength: [2, 'Name must be between 2 and 128 characters'],
    maxlength: [128, 'Name must be between 2 and 128 characters'],
    required: [true, 'Name is required'],
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: [true, 'E-mail is required'],
    trim: true,
    index: true,
    unique: true
  },
  password: {
    type: String,
    minlength: [8, 'Password must be between 8 and 256 characters'],
    maxlength: [256, 'Password must be between 8 and 256 characters'],
    default: null,
    trim: true
  },
  salt: {
    type: String,
    default: () => uid.sync(24)
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    trim: true,
    index: true
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  },
  resetPassword: {
    type: Boolean,
    default: true,
    index: true
  }
})

schema.methods.verifyPassword = function (email, password) {
  return this.email === email && this.password === model.encryptPassword(password, this.salt)
}

schema.statics.encryptPassword = (password = model.generatePassword(), salt = uid.sync(24)) => {
  return crypto.pbkdf2Sync(password, salt.toString(), 100000, 64, 'sha512').toString('base64')
}

schema.statics.generatePassword = (pattern = '?', length = 8, chars = { chars: 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ0123456789' }) => {
  if (pattern === '?') {
    return randomize(pattern, length, chars)
  }

  return randomize(pattern, length)
}

const model = mongoose.model('User', schema)

module.exports = model
