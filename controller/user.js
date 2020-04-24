
const User = require('../models/user');
const Profession = require('../models/profession')
const Company = require('../models/company')
const { errorHandler } = require('../helpers/dbErrorHandler')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

exports.users = (req, res) => {
  User.find({ published: true }, { "hashed_password": 0, "email": 0, "name": 0, username: 0 }).exec((err, users) => {
    if (err) {
      return res.status(300).json({ error: 'error' })
    }
    return res.json({ users })
  })
}
exports.user = (req, res) => {
  let { _id } = req.profile;
  User.findOne({ _id }, { "hashed_password": 0 })
    .populate('contactRequests', '_id companyName professions subProfessions city')
    .populate('acceptedByYou', '_id companyName professions subProfessions city')
    .populate('contactedByYou', '_id companyName professions subProfessions city')
    .populate('acceptedYourRequest', '_id companyName professions subProfessions city')
    .populate('blockList', '_id companyName professions subProfessions city')
    .exec((err, user) => {
      if (err) {
        return res.status(300).json({ error: 'error' })
      }
      return res.json(user)
    })
}
exports.publish = (req, res) => {
  const { _id } = req.profile;
  User.findById({ _id }).exec((err, user) => {
    if (err) {
      return res.status(300).json({ error: 'error' })
    }
    if (!user) {
      return res.status(300).json({ error: 'no user with this name' })
    }
    user.published = !user.published;
    user.save((saveErr, saveRes) => {
      if (saveErr) {
        return res.status(300).json({ error: saveErr })
      }
      return res.json({ success: 'success' })
    })
  })
}
exports.updateUser = (req, res) => {
  const { _id } = req.profile;
  User.findOne({ _id }, { "hashed_password": 0 })
    .exec((err, user) => {
      if (err) {
        return res.json({ err })
      }
      const { about,
        wantToWorkAs,
        cities,
        kindOfEmployment,
        salary,
        languages,
        lookingForJob,
        available,
        reasonToNewJob,
        workingRemotely,
        priorityBenefits,
        profession,
      } = req.body
      user.about = about.toLowerCase()
      user.wantToWorkAs = wantToWorkAs.toLowerCase()
      user.cities = cities.map(city => city.toLowerCase())
      user.kindOfEmployment = kindOfEmployment.toLowerCase()
      user.salary = salary
      user.languages = languages.map(lang => lang.toLowerCase())
      user.lookingForJob = lookingForJob.toLowerCase()
      user.available = available
      user.reasonToNewJob = reasonToNewJob
      user.workingRemotely = workingRemotely
      user.priorityBenefits = priorityBenefits
      const newProfession = new Profession({ ...profession })
      user.profession = newProfession;
      user.profileComplete = Object.values(req.body).map(value => typeof value === 'object' ? Array.isArray(value) ? !!value.length : !!value.subProfessions.length : !!value).indexOf(false) === -1
      user.save((err, response) => {
        if (err) {
          return res.json(err)
        }
        return res.json(user)
      });
    })
}
exports.listUsers = (req, res) => {
  const { _id } = req.body
  User.find({
    published: true,
    $or:
      [
        { 'profession.relatedId': _id },
        { 'profession.subProfessions.relatedId': _id }
      ]
  }, { "hashed_password": 0, "email": 0, "name": 0, username: 0 })
    .exec((err, users) => {
      if (err) {
        return res.json({ err })
      }
      return res.json({ users })
    })

}
exports.deleteMyProfile = (req, res) => {
  return res.json('created')
}
exports.companyJustForYou = (req, res) => {
  const { cities, profession, _id, blockList } = req.profile;
  Company.find(
    {
      $and: [{
        city: { "$in": cities },
        'professions': { $elemMatch: { name: profession.name } },
        contactedByYou: { "$ne": _id },
        acceptedYourRequest: { "$ne": _id },
        wantToContactYou: { "$ne": _id },
        acceptedByYou: { "$ne": _id },
        blockedUsers:{ "$ne": _id }
      },
      { 'subProfessions': { $elemMatch: { name: { $in: profession.subProfessions.map(profession => profession.name) } } } },
      { _id: { $nin: blockList } }
      ]
    },
    {
      'hashed_password': 0,
      email: 0,
      role: 0,
      profileComplete: 0,
      createdBy: 0,
      eventsTracker: 0,
      acceptedYourRequest: 0,
      contactedByYou: 0
    })
    .exec((error, company) => {
      if (error) {
        return res.json({ error: errorHandler(error) })
      }
      return res.json(company)
    })
}
exports.rejectRequest = (req, res) => {
  const { contactRequestId } = req.body
  const { _id } = req.profile;
  User.findById(_id).exec((error, user) => {
    if (error) {
      return res.json({ error: errorHandler(error) })
    }
    Company.findById(contactRequestId).exec((erro, company) => {
      if (erro) {
        return res.json({ error: errorHandler(erro) })
      }
      company.contactedByYou = company.contactedByYou.filter(contacted => contacted.toString() !== _id.toString())
      company.eventsTracker = [...company.eventsTracker, { eventName: `user reject yor contact request` }]

      company.save((er, companyResult) => {
        if (er) {
          return res.json({ error: errorHandler(er) })
        }
        user.eventsTracker = [...user.eventsTracker, { eventName: `you rejected request from ${company.companyName}` }]
        user.contactRequests = user.contactRequests.filter(contact => contact.toString() !== contactRequestId)
        user.save((err, result) => {
          if (err) {
            return res.json({ error: errorHandler(err) })
          }
          return res.json({ success: 'success' })
        })
      })
    })
  })
}
exports.cancelRequest = (req, res) => {
  const { contactRequestId } = req.body
  const { _id } = req.profile;
  User.findById(_id).exec((error, user) => {
    if (error) {
      return res.json({ error: errorHandler(error) })
    }
    Company.findById(contactRequestId).exec((erro, company) => {
      if (erro) {
        return res.json({ error: errorHandler(erro) })
      }
      company.wantToContactYou = company.wantToContactYou.filter(contacted => contacted.toString() !== _id.toString())
      company.acceptedByYou = company.acceptedByYou.filter(contacted => contacted.toString() !== _id.toString())
      company.acceptedYourRequest = company.acceptedYourRequest.filter(contacted => contacted.toString() !== _id.toString())
      company.eventsTracker = [...company.eventsTracker, { eventName: `user canceled his contact request` }]

      company.save((er, companyResult) => {
        if (er) {
          return res.json({ error: errorHandler(er) })
        }
        user.eventsTracker = [...user.eventsTracker, { eventName: `you canceled your request to ${company.companyName}` }]
        user.contactedByYou = user.contactedByYou.filter(contact => contact.toString() !== contactRequestId)
        user.acceptedYourRequest = user.acceptedYourRequest.filter(contact => contact.toString() !== contactRequestId)
        user.acceptedByYou = user.acceptedByYou.filter(contact => contact.toString() !== contactRequestId)
        user.save((err, result) => {
          if (err) {
            return res.json({ error: errorHandler(err) })
          }
          return res.json({ success: 'success' })
        })
      })
    })
  })
}
exports.acceptRequest = (req, res) => {
  const { contactRequestId } = req.body
  const { _id, name } = req.profile;
  Company.findById({_id:contactRequestId}).exec((error, company) => {
    if (error) {
      return res.json({ error: errorHandler(error) })
    }
    const { email } = company
    company.acceptedYourRequest = [...company.acceptedYourRequest, _id]
    company.eventsTracker = [...company.eventsTracker, { eventName: ` ${name} accepted your request` }]
    company.contactedByYou = company.contactedByYou.filter(contact => contact.toString() !== _id.toString())

    company.save((erro, result) => {
      if (erro) {
        return res.json({ error: errorHandler(erro) })
      }
      User.findById(_id).exec((err, user) => {
        if (err) {
          return res.json({ error: errorHandler(err) })
        }
        user.eventsTracker = [...user.eventsTracker, { eventName: `you accepted request from ${company.companyName}` }]
        user.acceptedByYou = [...user.acceptedByYou, contactRequestId]
        user.contactRequests = user.contactRequests.filter(contact => contact.toString() !== contactRequestId.toString())
        user.save((er, companyResult) => {
          if (er) {
            return res.json({ error: errorHandler(er) })
          }
          const emailData = {
            to: email,
            from: process.env.EMAIL_FROM,
            subject: `Contact Request accepted`,
            html: `<h4>there is user accepted you request</h4>`
          }
          sgMail.send(emailData).then(sent => {
            return res.json({ success: 'success' })
          })
        })
      })
    })
  })
}
exports.contactMe = (req, res) => {
  const { _id, profession } = req.profile;
  const { companyId } = req.body;
  Company.findById(companyId).exec((error, company) => {
    if (error) {
      return res.json({ error: errorHandler(error) })
    }
    company.wantToContactYou = [...company.wantToContactYou, _id]
    company.eventsTracker = [...company.eventsTracker, { eventName: `${profession.name} user sent contact request` }]
    const { email } = company;
    company.save((err, result) => {
      if (err) {
        return res.json({ error: errorHandler(err) })
      }
      User.findById(_id).exec((er, user) => {
        if (er) {
          return res.json({ error: errorHandler(er) })
        }
        user.contactedByYou = [...user.contactedByYou, companyId]
        user.eventsTracker = [...user.eventsTracker, { eventName: `you sent contact request to ${company.companyName}` }]

        user.save((e, result) => {
          if (e) {
            return res.json({ error: errorHandler(e) })
          }
          const emailData = {
            to: email,
            from: process.env.EMAIL_FROM,
            subject: `Contact Request`,
            html: `<h4> ${profession.name} user sent contact request </h4>, <p>login for more information</p>`
          }
          sgMail.send(emailData).then(sent => {
            return res.json({ success: 'success' })
          })
        })
      })
    })
  })

}
exports.blockCompany = (req, res) => {
  const { companyId } = req.body;
  const { _id } = req.profile;
  Company.findById({ _id: companyId }).exec((error, company) => {
    if (error) {
      return res.json({ error:errorHandler(error) })
    }
    if (!company) {
      return res.json({ error: 'no company with this id ' })
    }
    company.contactedByYou = company.acceptedByYou.filter(us=>us.toString()!==_id.toString())
    company.wantToContactYou = company.wantToContactYou.filter(us=>us.toString()!==_id.toString())
    company.acceptedYourRequest = company.acceptedYourRequest.filter(us=>us.toString()!==_id.toString())
    company.acceptedByYou = company.acceptedByYou.filter(us=>us.toString()!==_id.toString())
    company.save((companySaveError,companySaveResult)=>{
      if(companySaveError){
        return res.json({error:'please try again'})
      }
      User.findById({ _id }).exec((userError, user) => {
        if (userError) {
          return res.json({ error })
        }
        if (!user) {
          return res.json({ error: 'no user with this id ' })
        }
        user.blockList = [...user.blockList, companyId]
        user.eventsTracker = [...user.eventsTracker, { eventName: `you blocked ${company.companyName}` }]
        user.acceptedByYou = user.acceptedByYou.filter(ac => ac.toString() !== companyId.toString())
        user.contactRequests = user.contactRequests.filter(ac => ac.toString() !== companyId.toString())
        user.contactedByYou = user.contactedByYou.filter(ac => ac.toString() !== companyId.toString())
        user.acceptedYourRequest = user.acceptedYourRequest.filter(ac => ac.toString() !== companyId.toString())
        user.save((userSaveError, userSaveResult) => {
          if (userSaveError) { 
            return res.json({error:'please try again later'})
          }
          return res.json({success:'success'})
        })
      })
    })
   
  })
}
exports.unblockCompany = (req, res) => {
  const { companyId } = req.body;
  const { _id } = req.profile;
  Company.findById({ _id: companyId }).exec((error, company) => {
    if (error) {
      return res.json({ error:errorHandler(error) })
    }
    if (!company) {
      return res.json({ error: 'no company with this id ' })
    }
      User.findById({ _id }).exec((userError, user) => {
        if (userError) {
          return res.json({ error })
        }
        if (!user) {
          return res.json({ error: 'no user with this id ' })
        }
        user.blockList = user.blockList.filter(ac=>ac.toString()!==companyId.toString())
        user.eventsTracker = [...user.eventsTracker, { eventName: `you unblocked ${company.companyName}` }]
        user.save((userSaveError, userSaveResult) => {
          if (userSaveError) { 
            return res.json({error:'please try again later'})
          }
          return res.json({success:'success'})
        })
      })
   
  })
}