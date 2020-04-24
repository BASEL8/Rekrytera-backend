require('dotenv').config()
const User = require('../models/user');
const Company = require('../models/company')
const shortId = require('shortid');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const { errorHandler } = require('../helpers/dbErrorHandler')
const _ = require('lodash')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)



exports.preSignup = (req, res) => {
  const { email, password, name } = req.body;
  User.findOne({ email: email.toLowerCase() }, (err, user) => {
    if (user) {
      return res.status(400).json({
        error: 'Email is token'
      })
    }
    const token = jwt.sign({ email, password, name }, process.env.JWT_ACCOUNT_ACTIVATION_SECRET, { expiresIn: '1d' })
    const emailData = {
      to: email,
      from: process.env.EMAIL_FROM,
      subject: `Activation link`,
      html: `
    <h4>please use this link to activate you account<h4> 
    <a href="${process.env.CLIENT_URL}/user/activation/${token}">activate-link</a>
    `
    }

    sgMail.send(emailData).then(sent => {
      return res.json({
        success: `activation link has been sent to ${email}`
      })
    })
  })
}
exports.signup = (req, res) => {

  const { activationToken } = req.body
  if (activationToken) {
    jwt.verify(activationToken, process.env.JWT_ACCOUNT_ACTIVATION_SECRET, function (err, decoded) {
      if (err) {
        return res.status(400).json({
          error: 'link is expired'
        })
      } else {
        const { email, password, name } = decoded
        let username = shortId.generate();
        let profile = `${process.env.CLIENT_URL}/profile/${username}`;
        let newUser = new User({ name, email, password, profile, username });
        newUser.save((err, user) => {
          if (err) {
            return res.status(400).json({
              error: errorHandler(err)
            })
          }
          const name = user.name;
          const email = user.email
          res.json({ success: `Congratulations ${name}, you have an account and you will now be redirect to login page`, email })
        })

      }
    })
  } else {
    return res.status(400).json({
      error: 'something went wrong, please try agin later'
    })
  }


}
exports.signin = (req, res) => {
  const { email, password } = req.body
  //check if user exist
  User.findOne({ email }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User with this email dose not exist, Please signup'
      })
    }
    //authenticate
    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: 'Email and Password do not match'
      })
    }
    //generate a token send to client
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { expiresIn: '1d' })
    user.hashed_password = undefined
    res.json({
      token,
      user
    })
  })
}
exports.signOut = (req, res) => {
  res.clearCookie('token');
  res.json({
    message: 'signout success'
  })
}
exports.forgetPassword = (req, res) => {
  const { email } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({
        error: 'user with this email dose not found'
      })
    } else if (user) {
      const token = jwt.sign({ _id: user._id }, process.env.JWT_resetPassword_SECRET, { expiresIn: '10m' })
      //send email 
      const emailData = {
        to: email,
        from: process.env.EMAIL_FROM,
        subject: `Password reset link`,
        html: `
        <h4>please use this link to reset your password<h4> 
        <a href="${process.env.CLIENT_URL}/user/reset-password/${token}">reset-link</a>
        `
      }
      return user.updateOne({ resetPassword: token }, (err, success) => {
        if (err) {
          return res.json({
            error: err
          })
        }
        sgMail.send(emailData).then(sent => {
          return res.json({
            message: `Email has been sent to ${email}, follow the instruction to reset your password, the link expire in 10 min`
          })
        })
      })
    }

  })

}
exports.resetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;
  if (resetPasswordLink) {
    jwt.verify(resetPasswordLink, process.env.JWT_resetPassword_SECRET, function (err, decoded) {
      if (err) {
        return res.status(401).json({
          error: 'expired link'
        })
      } else {
        User.findOne({ resetPassword: resetPasswordLink }, (err, user) => {
          if (err || !user) {
            return res.status(401).json({
              error: 'something went wrong, please try later'
            })
          }
          else {
            const updatedFields = {
              password: newPassword,
              resetPassword: ''
            }
            user = _.extend(user, updatedFields)
            user.save((err, success) => {
              if (err) {
                return res.status(400).json({
                  error: errorHandler(err)
                })
              }
              res.json({
                email: user.email,
                message: 'now you can login with your new password'
              })
            })
          }
        })
      }
    })
  }
  res.status(200)
}




exports.preSignupCompany = (req, res) => {
  const { email, password, companyName, organisationNumber } = req.body;
  Company.findOne({ email: email.toLowerCase() }, (err, user) => {
    if (user) {
      return res.status(400).json({
        error: 'Email is exist, try to rest'
      })
    }
    const token = jwt.sign({ email, password, companyName, organisationNumber }, process.env.JWT_ACCOUNT_ACTIVATION_SECRET, { expiresIn: '1d' })
    const emailData = {
      to: email,
      from: process.env.EMAIL_FROM,
      subject: `Activation link`,
      html: `
    <h4>please use this link to activate you account<h4> 
    <a href="${process.env.CLIENT_URL}/company/activation/${token}">activate-link</a>
    `
    }

    sgMail.send(emailData).then(sent => {
      return res.json({
        success: `activation link has been sent to ${email}`
      })
    })
  })
}
exports.signupCompany = (req, res) => {
  const { activationToken } = req.body
  if (activationToken) {
    jwt.verify(activationToken, process.env.JWT_ACCOUNT_ACTIVATION_SECRET, function (err, decoded) {
      if (err) {
        return res.status(400).json({
          error: 'link is expired'
        })
      } else {
        const { email, password, companyName, organisationNumber } = decoded
        let profile = `${process.env.CLIENT_URL}/profile/company/${companyName}`;
        let newCompany = new Company({ email, password, companyName, organisationNumber, profile });
        newCompany.save((err, company) => {
          if (err) {
            return res.status(400).json({
              error: errorHandler(err)
            })
          }
          const companyName = company.companyName;
          const email = company.email
          res.json({ success: `Congratulations ${companyName}, you have an account and you will now be redirect to login page`, email })
        })
      }
    })
  } else {
    return res.status(400).json({
      error: 'something went wrong, please try agin later'
    })
  }
}
exports.signinCompany = (req, res) => {
  const { email, password } = req.body
  //check if user exist
  Company.findOne({ email }).exec((err, company) => {
    if (err || !company) {
      return res.status(400).json({
        error: 'User with this email dose not exist, Please signup'
      })
    }
    //authenticate
    if (!company.authenticate(password)) {
      return res.status(400).json({
        error: 'Email and Password do not match'
      })
    }
    //generate a token send to client
    const token = jwt.sign({ _id: company._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { expiresIn: '1d' })
    const { email, companyName, organisationNumber, profile, profileComplete, _id } = company
    res.json({
      token,
      user: { email, companyName, organisationNumber, profile, profileComplete, _id }
    })
  })
}
exports.companyForgetPassword = (req, res) => {
  const { email } = req.body;
  Company.findOne({ email }, (err, company) => {
    if (err || !company) {
      return res.status(401).json({
        error: 'company with this email dose not found'
      })
    } else if (company) {
      const token = jwt.sign({ _id: company._id }, process.env.JWT_resetPassword_SECRET, { expiresIn: '10m' })
      //send email 
      const emailData = {
        to: email,
        from: process.env.EMAIL_FROM,
        subject: `Password reset link`,
        html: `
        <h4>please use this link to reset your password<h4> 
        <a href="${process.env.CLIENT_URL}/company/reset-password/${token}">reset-link</a>
        `
      }
      return company.updateOne({ resetPassword: token }, (err, success) => {
        if (err) {
          return res.json({
            error: err
          })
        }
        sgMail.send(emailData).then(sent => {
          return res.json({
            message: `Email has been sent to ${email}, follow the instruction to reset your password, the link expire in 10 min`
          })
        })
      })
    }

  })

}
exports.companyResetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;
  if (resetPasswordLink) {
    jwt.verify(resetPasswordLink, process.env.JWT_resetPassword_SECRET, function (err, decoded) {
      if (err) {
        return res.status(401).json({
          error: 'expired link'
        })
      } else {
        Company.findOne({ resetPassword: resetPasswordLink }, (err, company) => {
          if (err || !company) {
            return res.status(401).json({
              error: 'something went wrong, please try later'
            })
          }
          else {
            const updatedFields = {
              password: newPassword,
              resetPassword: ''
            }
            company = _.extend(company, updatedFields)
            company.save((err, success) => {
              if (err) {
                return res.status(400).json({
                  error: errorHandler(err)
                })
              }
              res.json({
                email: company.email,
                message: 'now you can login with your new password'
              })
            })
          }
        })
      }
    })
  }
  res.status(200)
}

exports.requiresignin = expressJwt({
  secret: process.env.JWT_SECRET
})
exports.authMiddleware = (req, res, next) => {
  const authUserId = req.user._id;
  User.findById({ _id: authUserId }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found'
      })
    }
    req.profile = user;
    next();
  })
}
exports.companyAuthMiddleware = (req, res, next) => {
  const authUserId = req.user._id;
  Company.findById({ _id: authUserId }).exec((err, company) => {
    if (err || !company) {
      return res.status(400).json({
        error: 'company not found'
      })
    }
    req.profile = company;
    next();
  })
}
exports.adminMiddleware = (req, res, next) => {
  const adminUserId = req.user._id;
  User.findById({ _id: adminUserId }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found'
      })
    }
    if (user.role !== 1) {
      return res.status(400).json({
        error: 'admin resource access denied'
      })
    }
    req.profile = user;
    next();
  })
}