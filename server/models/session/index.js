const mongoose = require('mongoose')

const Schema = mongoose.Schema

const schema = new Schema({
  expiredAt: {
    type: Date,
    default: () => new Date(),
    index: true
  },
  rememberMe: {
    type: Boolean,
    default: false,
    index: true
  },
  token: {
    type: String,
    required: [true, 'Token is required'],
    index: true
  },
  lastToken: {
    type: String,
    default: null,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: [true, 'User ID is required'],
    index: true
  },
  userIp: {
    type: String,
    required: [true, 'User IP is required']
  },
  createdAt: {
    type: Date,
    default: newDate,
    index: true
  },
  updatedAt: {
    type: Date,
    default: null,
    index: true
  }
})

function newDate () {
  return new Date()
}

const model = mongoose.model('Session', schema)

module.exports = model
