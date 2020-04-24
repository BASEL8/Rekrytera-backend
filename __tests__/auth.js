const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
//const { extractCookies, shapeFlags } = require("../helpers/extract-cookies");
require('dotenv').config();
const url = process.env.API_URL

let testUser = { email: 'basel84mn@gmail.com', password: '123123123', name: '123123123' }
describe('User Model Test', () => {
  let token;
  let resetPasswordToken;
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
    await User.remove({ email: testUser.email })
    return done()
  })
  it('post /pre-signup', async (done) => {
    const response = await request(url)
      .post(`/pre-signup`)
      .send(testUser)
    console.log(response.body)
    expect(response.status).toEqual(200);
    expect(response.body.success).toBe(`activation link has been sent to ${testUser.email}`)
    if (response.status === 200) {
      token = jwt.sign(testUser, process.env.JWT_ACCOUNT_ACTIVATION_SECRET, { expiresIn: '1d' })
    }
    return done()
  })
  it('post /signup', async (done) => {
    const response = await request(url)
      .post('/signup')
      .send({ activationToken: token })
    expect(response.status).toEqual(200)
    expect(response.body.success).toBe('Signup success! please login')
    expect(response.body.name).toEqual(testUser.name)
    expect(response.body.email).toEqual(testUser.email)
    return done()
  });
  it('post /signin', async (done) => {
    const response = await request(url)
      .post(`/signin`)
      .send({ email: testUser.email, password: testUser.password })
    //const cookies = extractCookies(response.headers);
    //need more tests
    expect(response.status).toEqual(200)
    expect(response.body.token).toBeDefined()
    expect(response.body.user._id).toBeDefined()
    expect(response.body.user.name).toEqual(testUser.name)
    expect(response.body.user.email).toEqual(testUser.email)
    testUser._id = response.body.user._id
    return done()
  });
  it('put /signout', async (done) => {
    const response = await request(url)
      .get('/signout')
    expect(response.status).toEqual(200)
    expect(response.body.message).toBe('signout success')
    done()
  });
  it('put /forget-password', async (done) => {
    const response = await request(url)
      .put('/forget-password')
      .send({ email: testUser.email })
    expect(response.status).toEqual(200)
    expect(response.body.message).toBe(`Email has been sent to ${testUser.email}, follow the instruction to reset your password, the link expire in 10 min`)
    if (response.status === 200) {
      resetPasswordToken = jwt.sign({ _id: testUser._id }, process.env.JWT_resetPassword_SECRET, { expiresIn: '10m' })
    }
    done()
  });
  it('put /reset-password', async (done) => {
    const response = await request(url)
      .put('/reset-password')
      .send({ resetPasswordLink: resetPasswordToken, newPassword: '5555555' })
    expect(response.status).toEqual(200)
    expect(response.body.email).toBe(testUser.email)
    expect(response.body.message).toBe('now you can login with your new password')
    done()
  });
})

