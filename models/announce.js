const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema
const { testSchema } = require('./profession')
const announceSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    lowercase: true
  },
  kindOfEmployment: {
    type: String,
    required: true,
  },
  workingRemotely: {
    type: String,
    required: true
  },
  priorityBenefits: {
    type: [],
    default: undefined,
    required: true,
  },
  profession: { type: { testSchema }, require: true },
  company: { type: ObjectId, ref: 'Company', require: true },
}, { timestamps: true })
module.exports = mongoose.model('Announce', announceSchema);