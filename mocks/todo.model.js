const mongoose = require('mongoose')

const TodoSchema = new mongoose.Schema({
  name: { type: String, require: true },
  completed: { type: Boolean, default: false }
})

module.exports = mongoose.model('Todo', TodoSchema)
