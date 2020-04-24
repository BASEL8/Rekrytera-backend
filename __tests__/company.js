const request = require('supertest');
const mongoose = require('mongoose');
const Company = require('../models/company');
const Profession = require('../models/profession')
const jwt = require('jsonwebtoken');

//const { extractCookies, shapeFlags } = require("../helpers/extract-cookies");
require('dotenv').config();
const url = process.env.API_URL

let testUser = { email: 'basel84mn@gmail.com', password: '123123123', companyName: 'company hbg', organisationNumber: '111111' }


describe('Company Model Test', () => {
  let profession;
  let token;
  let signinToken;
  let resetPasswordToken;
  let announceBody = {
    wantToWorkAs: 'java',
    cities: ['helsingborg'],
    salary: '30000',
    lookingForJob: 'yes',
    available: '2020-12-20',
    workingRemotely: 'yes',
    priorityBenefits: [],
    profession: ''
  }
  beforeAll(async (done) => {
    await mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useCreateIndex: true }, (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      return done()
    });
  });
  afterAll(async (done) => {
    await Company.remove({ email: testUser.email })
    return done()
  })
  it('create profession', () => {
    profession = new Profession({ name: 'Test', subProfessions: [{ name: 'rest' }, { name: 'r' }] })
  })
  // it('post /company/pre-signup', async (done) => {
  //   const response = await request(url)
  //     .post(`/company/pre-signup`)
  //     .send(testUser)
  //   expect(response.status).toEqual(200);
  //   expect(response.body.success).toBe(`activation link has been sent to ${testUser.email}`)
  //   if (response.status === 200) {
  //     token = jwt.sign(testUser, process.env.JWT_ACCOUNT_ACTIVATION_SECRET, { expiresIn: '1d' })
  //   }
  //   return done()
  // })
  it('post /company/signup', async (done) => {
    const response = await request(url)
      .post('/company/signup')
      .send({
        activationToken: token = jwt.sign(testUser, process.env.JWT_ACCOUNT_ACTIVATION_SECRET, { expiresIn: '1d' })
      })
    expect(response.status).toEqual(200)
    expect(response.body.success).toBe('Signup success! please login')
    expect(response.body.name).toEqual(testUser.name)
    expect(response.body.email).toEqual(testUser.email)
    return done()
  });
  it('post /company/signin', async (done) => {
    const response = await request(url)
      .post(`/company/signin`)
      .send({ email: testUser.email, password: testUser.password })
    //const cookies = extractCookies(response.headers);
    //need more tests
    signinToken = response.body.token
    expect(response.status).toEqual(200)
    expect(response.body.token).toBeDefined()
    expect(response.body.company._id).toBeDefined()
    expect(response.body.company.name).toEqual(testUser.name)
    expect(response.body.company.email).toEqual(testUser.email)
    testUser._id = response.body.company._id
    return done()
  });
  // it('put /signout', async (done) => {
  //   const response = await request(url)
  //     .get('/signout')
  //   expect(response.status).toEqual(200)
  //   expect(response.body.message).toBe('signout success')
  //   done()
  // });
  // it('put /company/forget-password', async (done) => {
  //   const response = await request(url)
  //     .put('/company/forget-password')
  //     .send({ email: testUser.email })
  //   expect(response.status).toEqual(200)
  //   expect(response.body.message).toBe(`Email has been sent to ${testUser.email}, follow the instruction to reset your password, the link expire in 10 min`)
  //   if (response.status === 200) {
  //     resetPasswordToken = jwt.sign({ _id: testUser._id }, process.env.JWT_resetPassword_SECRET, { expiresIn: '10m' })
  //   }
  //   done()
  // });
  // it('put  /company/reset-password', async (done) => {
  //   const response = await request(url)
  //     .put('/company/reset-password')
  //     .send({ resetPasswordLink: resetPasswordToken, newPassword: '5555555' })
  //   expect(response.status).toEqual(200)
  //   expect(response.body.email).toBe(testUser.email)
  //   expect(response.body.message).toBe('now you can login with your new password')
  //   done()
  // });
  it('post /company/announce', async (done) => {
    const response = await request(url)
      .post('/company/announce')
      .set({
        Accept: 'application/form',
        Authorization: `Bearer ${signinToken}`
      })
      .send({
        wantToWorkAs: 'java',
        cities: ['helsingborg'],
        salary: '30000',
        lookingForJob: 'yes',
        available: '2020-12-20',
        workingRemotely: 'yes',
        priorityBenefits: [],
        profession: [profession._id]
      })
    console.log(response.body)
    done()
  })
})

