const mongoose = require('mongoose')

const medicalTestSchema = mongoose.Schema({
  name: String,
  description: String,
  startDate: Date,
  endDate: Date,
  priority: String,
  status: String
})

const medicalTestModel = mongoose.model('medicalTests', medicalTestSchema)

module.exports = { medicalTestModel, medicalTestSchema }