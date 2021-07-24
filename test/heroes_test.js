/* eslint-disable no-undef */
const { assert, requester } = require('./set_up')
const { heroes, heroId1, heroesProfile, heroId1Profile } = require('./fake_data')
const { nockFakeData, nockInputErrFakeData, nockcleanAll } = require('./fake_data_generator')
const { NODE_ENV } = process.env

describe('hahow-recruit heroes normal test', function () {
  before(() => {
    if (NODE_ENV !== 'test') {
      throw new Error({ error: 'not in the test mode' })
    }
    nockFakeData()
  })

  it('List Heroes', async function () {
    const res = await requester
      .get('/heroes')
    assert.deepStrictEqual(res.body, heroes)
  })

  it('Single Hero', async function () {
    const res = await requester
      .get('/heroes/1')
    assert.deepStrictEqual(res.body, heroId1)
  })

  it('Authenticated List Heroes', async function () {
    const res = await requester
      .get('/heroes')
      .set('name', 'hahow')
      .set('password', 'rocks')
    assert.deepStrictEqual(res.body, heroesProfile)
  })

  it('Authenticated Single Hero', async function () {
    const res = await requester
      .get('/heroes/1')
      .set('name', 'hahow')
      .set('password', 'rocks')
    assert.deepStrictEqual(res.body, heroId1Profile)
  })

  after(() => {
    nockcleanAll()
  })
})

describe('hahow-recruit heroes Input error test', function () {
  before(() => {
    if (NODE_ENV !== 'test') {
      throw new Error({ error: 'not in the test mode' })
    }
    nockInputErrFakeData()
  })

  it('404 page', async function () {
    const res = await requester
      .get('/justErr')
    assert.equal(res.status, 404)
  })

  it('Single Hero id format incorrect', async function () {
    const res = await requester
      .get('/heroes/err')
    assert.equal(res.status, 400)
    assert.equal(res.body.message, 'the hero id should be a positive interger')
  })

  it('Single Hero id out of range', async function () {
    const res = await requester
      .get('/heroes/999')
    assert.equal(res.status, 400)
    assert.equal(res.body.message, 'maybe the input hero id out of range, please try other id again')
  })

  it('Authenticated List Heroes password incorrect', async function () {
    const res = await requester
      .get('/heroes')
      .set('name', 'hahow')
      .set('password', 'rockssss')
    assert.equal(res.status, 400)
    assert.equal(res.body.message, 'Please check Name & Password')
  })
  after(() => {
    nockcleanAll()
  })
})
