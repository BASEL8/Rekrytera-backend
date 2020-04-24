const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/user');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const url = process.env.API_URL
const testUser = { name: 'admin', email: 'basel84mn@gmail.com', password: '12121212', role: '1', profile: '123123', username: '234234' }
describe('Profession Model Test', () => {
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
    await User.remove({ _id: testUser._id })
    return done()
  })
  it('create & save user successfully', async (done) => {
    const user = new User(testUser);
    const savedUser = await user.save();
    testUser._id = savedUser._id
    token = jwt.sign({ _id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return done()
  });
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
      expect(response.status).toEqual(200);
      expect(response.body._id).toBeDefined()
      if (response.status === 200) {
        professions[index] = { ...response.body }
      }
    }
    done()
    return
  })
  it('get /professions', async (done) => {
    const response = await request(url)
      .get('/professions')
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    expect(response.status).toEqual(200)
    expect(response.body.professions.length).toBeGreaterThan(0)
    done()
  })
  it('edit profession', async (done) => {
    const response = await request(url)
      .put('/profession')
      .send({
        _id: professions[0]._id,
        name: 'ui',
        subProfessions: [{ name: 'test' }]
      })
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    expect(response.body.name).toBe('ui')
    expect(response.body.subProfessions).toHaveLength(1)
    done()
  })
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

