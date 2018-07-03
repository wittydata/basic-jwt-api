const mongoose = require('mongoose')

const Modules = require('./modules')

const Schema = mongoose.Schema

const schema = new Schema({
  module: {
    type: String,
    enum: {
      values: Object.values(Modules),
      message: '`{VALUE}` is invalid module'
    },
    required: [true, 'Module is required'],
    trim: true,
    index: true
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true,
    index: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    index: true
  },
  grants: [String]
})

const model = mongoose.model('Permission', schema)

module.exports = model
