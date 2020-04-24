const mongoose = require('mongoose');

const SubProfession = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true,
    lowercase: true
  },
  years: {
    type: Number,
  },
  relatedId: {
    type: String,
  }
});
const professionSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    max: 32,
    unique: true,
    index: true,
    lowercase: true
  },
  relatedId: {
    type: String,
  },
  salt: String,
  years: {
    type: Number,
  },
  subProfessions: {
    type: [SubProfession],
    default: undefined
  }
}, { timestamps: true })

module.exports = mongoose.model('Profession', professionSchema);
exports.testSchema = professionSchema;