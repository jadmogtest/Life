const mongoose = require('mongoose')

const illnessSchema = mongoose.Schema({
  name: String
})

const illnessModel = mongoose.model('illnesses', illnessSchema)

module.exports = { illnessModel, illnessSchema }