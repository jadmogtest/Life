const mongoose = require('mongoose')

const vaccineSchema = mongoose.Schema({
  name: String,
  description: String,
  startDate: Date,
  endDate: Date,
  startAge: Number,
  endAge: Number,
  sex: String,
  profession: String,
  priority: String,
  status: String
})

const vaccineModel = mongoose.model('vaccines', vaccineSchema)

module.exports = { vaccineModel, vaccineSchema }