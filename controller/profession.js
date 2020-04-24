const Profession = require('../models/profession')

exports.create = (req, res) => {
  const { name, subProfessions } = req.body;
  const profession = new Profession({ name, subProfessions })
  profession.save((err, result) => {
    if (err) {
      return res.json({ err })
    }
    return res.json(profession)
  })
}
exports.list = (req, res) => {
  Profession.find({}).exec((err, professions) => {
    if (err) {
      return res.json({ err })
    }
    return res.json({ professions })
  })
}
exports.update = (req, res) => {
  const { _id, ...data } = req.body;
  Profession.findById({ _id }).exec((err, profession) => {
    if (err) {
      return res.json({ err })
    }
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        profession[key] = data[key]
      }
    }
    profession.save((error, result) => {
      if (error) {
        return res.json({ err: error })
      }
      else {
        return res.json(result)
      }
    })
  })
}
exports.adminRemoveProfession = (req, res) => {
  const { _id } = req.body;
  Profession.findOneAndRemove({ _id }).exec((err, data) => {
    if (err) {
      return res.json({ err })
    }
    res.json({ message: 'profession deleted successfully' })
  })
}
exports.listRelated = (req, res) => {
  return res.json({ created: 'done' })
}
exports.listSearch = (req, res) => {
  return res.json({ created: 'done' })
}