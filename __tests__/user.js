const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/user');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const url = process.env.API_URL
let data = [
  {
    username: 'basel' + Math.floor(Math.random() * 10000),
    name: 'basel munawwar',
    email: 'basel8sd4mn@gmail.com' + Math.floor(Math.random() * 10000),
    profile: '/basel_munawwar',
    password: 'password',
    role: '1',
    published: true
  },
  {
    username: 'basel' + Math.floor(Math.random() * 10000),
    name: 'basel munawwar',
    email: 'basel@gmail.com' + Math.floor(Math.random() * 10000),
    profile: '/basel_munawwar',
    password: 'password',
  },
  {
    username: 'basel' + Math.floor(Math.random() * 10000),
    name: 'basel munawwar',
    email: 'basel@gmail.com' + Math.floor(Math.random() * 10000),
    profile: '/basel_munawwar',
    password: 'password',
    published: true
  }]
describe('User Model Test', () => {
  let token;
  let professions = [
    { name: 'Test', subProfessions: [{ name: 'rest' }, { name: 'r' }] },
    { name: 'Designer', subProfessions: [{ name: 'UI/UX' }, { name: 'Graphic design' }] },
    { name: 'Developer', subProfessions: [{ name: 'FrontEnd' }, { name: 'Backend' }] }
  ];
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
    for (let index = 0; index < data.length; index++) {
      await User.remove({ _id: data[index]._id })
    }
    return done()
  })
  it('create & save user successfully', async (done) => {
    for (let index = 0; index < data.length; index++) {
      const user_1 = new User(data[index]);
      const savedUser = await user_1.save();
      data[index] = {};
      data[index]._id = savedUser._id
      expect(savedUser._id).toBeDefined();
      expect(savedUser._id).toBe(data[index]._id);
    }
    token = jwt.sign({ _id: data[0]._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return done()
  });
  //all users
  it('post /profession', async (done) => {
    for (let index = 0; index < professions.length; index++) {
      const response = await request(url)
        .post(`/profession`)
        .set({
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        })
        .send({ ...professions[index] })
      console.log(response.body)
      expect(response.status).toEqual(200);
      expect(response.body._id).toBeDefined()
      if (response.status === 200) {
        professions[index] = { ...response.body }
      }
    }
    done()
    return
  })
  it('get /users', async (done) => {
    const response = await request(url)
      .get(`/users`)
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    expect(response.statusCode).toEqual(200);
    expect(typeof response.body).toBe('object');
    expect(response.body.users).toBeDefined();
    response.body.users.forEach(user => {
      expect(data.map(u => u.username).indexOf(user.username))
        .not
        .toBe(-1)
      expect(user.published).toBeTruthy()
      expect(user.email).toBeUndefined()
      expect(user.hashed_password).toBeUndefined()
    });
    return done()
  })
  ///user
  it('get /user/:_id', async (done) => {
    const response = await request(url)
      .get(`/user/${data[0]._id}`)
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    expect(response.statusCode).toEqual(200);
    expect(typeof response.body).toBe('object');
    expect(response.body.username).toEqual(data[0].username)
    expect(response.body.email).toBeUndefined()
    expect(response.body.hashed_password).toBeUndefined()
    return done()
  });
  // //publish
  it('put /user/publish', async (done) => {
    const response = await request(url)
      .put(`/user/publish`)
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
      .send({
        _id: data[0]._id,
        published: true
      })
    expect(response.statusCode).toEqual(200);
    expect(typeof response.body).toBe('object');
    expect(response.body._id.toString()).toEqual(data[0]._id.toString())
    expect(response.body.email).toBeUndefined()
    expect(response.body.hashed_password).toBeUndefined()
    expect(response.body.published).toBeTruthy()
    return done()
  });
  // //hide

  // //update user
  it('put /user/update', async (done) => {
    const obj = {
      name: professions[0].name,
      relatedId: professions[0]._id,
      years: '5',
      subProfessions: [
        {
          name: professions[0].subProfessions[0].name,
          relatedId: professions[0].subProfessions[0]._id,
          years: '7'
        }
      ]
    }
    await request(url)
      .put('/user/update')
      .send({
        _id: data[0]._id,
        cities: ['Stockholm', 'Helsingborg'],
        kindOfEmployment: 'employment',
        salary: 3000,
        languages: ['arabic', 'swedish', 'english'],
        profession: obj
      })
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    User.findOne({ _id: data[0]._id }).exec((err, user) => {
      expect(user._id).toEqual(data[0]._id)
      expect(user.languages.length).toEqual(3)
      expect(user.languages[0]).toEqual('arabic')
      expect(user.cities.length).toEqual(2)
      expect(user.cities[1]).toEqual('Helsingborg')
    })
    done()
  });
  it('put user 2 ', async (done) => {
    const obj = {
      name: professions[0].name,
      relatedId: professions[0]._id,
      years: '5',
      subProfessions: [
        {
          name: professions[0].subProfessions[0].name,
          relatedId: professions[0].subProfessions[1]._id,
          years: '7'
        }
      ]
    }
    await request(url)
      .put('/user/update')
      .send({
        _id: data[1]._id,
        cities: ['Stockholm', 'Helsingborg'],
        kindOfEmployment: 'employment',
        salary: 3000,
        languages: ['arabic', 'swedish', 'english'],
        profession: obj
      })
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    User.findOne({ _id: data[1]._id }).exec((err, user) => {
      expect(user._id).toEqual(data[1]._id)
      expect(user.languages.length).toEqual(3)
      expect(user.languages[0]).toEqual('arabic')
      expect(user.cities.length).toEqual(2)
      expect(user.cities[1]).toEqual('Helsingborg')
    })
    done()
  })
  it('post /users', async (done) => {
    const response = await request(url)
      .post('/users')
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
      .send({
        _id: professions[0].subProfessions[0]._id
      })
    expect(response.status).toEqual(200);
    expect(typeof response.body).toBe('object');
    expect(response.body.users[0].hashed_password).toBeUndefined()
    expect(response.body.published).toBeFalsy()
    done()
  })
  it('delete /delete-my-account', () => { });
  it('delete /remove-user/:userId', () => { });
  it('delete /profession/adminRemoveProfession', async (done) => {
    for (let index = 0; index < professions.length; index++) {
      const response = await request(url)
        .delete('/profession/adminRemoveProfession')
        .set({
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        })
        .send({
          _id: professions[index]._id
        })
      expect(response.status).toEqual(200)
      expect(response.body.message).toBe('profession deleted successfully')
    }
    done()
  })
})

