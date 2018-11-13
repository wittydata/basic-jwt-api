const mongoose = require('mongoose')

const Schema = mongoose.Schema

const schema = new Schema({
  name: {
    type: String,
    minlength: [2, 'Name must be between 2 and 128 characters'],
    maxlength: [128, 'Name must be between 2 and 128 characters'],
    required: [true, 'Name is required'],
    trim: true,
    index: true,
    unique: true
  },
  sequence: {
    type: Number,
    default: Number.MAX_SAFE_INTEGER,
    index: true
  }
})

const model = mongoose.model('Role', schema)

module.exports = model
