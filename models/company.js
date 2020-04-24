const mongoose = require('mongoose');
const crypto = require('crypto');
const { ObjectId } = mongoose.Schema
//const { testSchema } = require('./profession')
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
const Profession = new mongoose.Schema({
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
})
const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    index: true,
    lowercase: true
  },
  organisationNumber: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  confirmed: {
    type: Boolean,
    default: false
  },
  profileComplete: {
    type: Boolean,
    default: false
  },
  email: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,
    unique: true,
  },
  profile: {
    type: String,
    required: true
  },
  website: {
    type: String,
    lowercase: true
  },
  hashed_password: {
    type: String,
    required: true
  },
  salt: String,
  about: {
    type: String
  },
  role: {
    type: Number,
    default: 0
  },
  resetPassword: {
    data: String,
    default: ''
  },
  logo: {
    data: Buffer,
    contentType: String
  },
  createdBy: {
    type: String,
    lowercase: true
  },
  city: {
    type: String,
    lowercase: true
  },
  workingRemotely: {
    type: String
  },
  professions: [{ type:  Profession , require: true }],
  subProfessions: [{ type:  SubProfession , require: true }],
  contactedByYou: [{ type: ObjectId, ref: 'User', require: true }],
  wantToContactYou: [{ type: ObjectId, ref: 'User', require: true }],
  eventsTracker: [{ eventName: { type: String }, date: { type: Date, default: Date.now } }],
  acceptedYourRequest: [{ type: ObjectId, ref: 'User', require: true }],
  acceptedByYou: [{ type: ObjectId, ref: 'User', required: true }],
  blockedUsers: [{ type: ObjectId, ref: 'User', required: true }]
}, { timestamps: true })
companySchema.virtual('password')
  .set(function (password) {
    //create a temporary variable called hashed_password
    this._password = password

    //generate salt

    this.salt = this.makeSalt()
    //encryptPassword

    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () { return this._password })
companySchema.methods = {
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password
  },
  encryptPassword: function (password) {
    if (!password) return '';
    try {
      return crypto.createHmac('sha1', this.salt).update(password).digest('hex')
    } catch (err) {
      return ''
    }
  },
  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + ''
  }
}

module.exports = mongoose.model('Company', companySchema);