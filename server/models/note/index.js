const mongoose = require('mongoose')

const Schema = mongoose.Schema

const schema = new Schema({
  title: {
    type: String,
    minlength: [2, 'Name must be between 2 and 128 characters'],
    maxlength: [128, 'Name must be between 2 and 128 characters'],
    required: [true, 'Title is required'],
    trim: true,
    index: true
  },
  content: {
    type: String,
    minlength: [2, 'Name must be between 2 and 512 characters'],
    maxlength: [512, 'Name must be between 2 and 512 characters'],
    required: [true, 'Content is required'],
    trim: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: newDate
  },
  createdBy: {
    type: String,
    default: null,
    trim: true,
    index: true
  },
  updatedAt: {
    type: Date,
    default: newDate
  },
  updatedBy: {
    type: String,
    default: null,
    trim: true,
    index: true
  }
})

function newDate () {
  return new Date()
}

const model = mongoose.model('Note', schema)

module.exports = model
