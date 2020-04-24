const { check } = require('express-validator');
var ObjectId = require('mongoose').Types.ObjectId;
exports.usersValidation = []
exports.publishValidation = []

exports.updateUserValidation = [
  check('wantToWorkAs')
    .not()
    .isEmpty()
    .withMessage('work as is required')
    .isString()
    .withMessage('must be string')
  ,
  check('cities')
    .not()
    .isEmpty()
    .withMessage('work as is required')
    .isArray()
    .withMessage('must be array')
  ,
  check('kindOfEmployment')
    .not()
    .isEmpty()
    .withMessage('kind of employment is required')
    .isString()
    .withMessage('must be string')
  ,
  check('salary')
    .not()
    .isEmpty()
    .withMessage('salary is required')
    .isNumeric()
    .withMessage('must be Number')
  ,
  check('languages')
    .not()
    .isEmpty()
    .withMessage('languages as is required')
    .isArray()
    .withMessage('must be array')
  ,
  check('lookingForJob')
    .not()
    .isEmpty()
    .withMessage('looking for job is required')
    .isString()
    .withMessage('must be string')
  ,
  check('available')
    .not()
    .isEmpty()
    .withMessage('available is required')
    .isString()
    .withMessage('must be string')
  ,
  check('about')
    .not()
    .isEmpty()
    .withMessage('about is required')
    .isString()
    .withMessage('must be string')
  ,
  check('reasonToNewJob')
    .not()
    .isEmpty()
    .withMessage('reason to new job is required')
    .isString()
    .withMessage('must be string')
  ,
  check('workingRemotely')
    .not()
    .isEmpty()
    .withMessage('working Remotely is required')
    .isString()
    .withMessage('must be string')
  ,
  check('priorityBenefits')
    .not()
    .isEmpty()
    .withMessage('working Remotely is required')
    .isArray()
    .withMessage('must be array')
  ,
  check('profession')
    .not()
    .isEmpty()
    .withMessage('profession is required')
]
exports.deleteMyProfileValidation = []
exports.AdminRemoveUserValidation = []
exports.listUsersValidation = []
exports.companyJustForYouValidation = []
exports.rejectRequestValidation = []
exports.acceptRequestValidation = []
exports.contactMeValidation = []
exports.cancelRequestValidation = []