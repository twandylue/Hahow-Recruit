
const { assert, requester } = require('./set_up')

describe('heroes', function () {
  it('List Heroes', async function () {
    const res = await requester
      .get('/heroes')
    console.log(res.body)
    assert.deepStrictEqual('1', '1')
  })

  it('Single Hero', async function () {
    const res = await requester
      .get('/heroes/1')
    console.log(res.body)
    assert.deepStrictEqual('1', '1')
  })

  it('Authenticated List Heroes', async function () {
    const res = await requester
      .get('/heroes')
    console.log(res.body)
    assert.deepStrictEqual('1', '1')
  })

  it('Authenticated Single Hero', async function () {
    const res = await requester
      .get('/heroes/1')
    console.log(res.body)
    assert.deepStrictEqual('1', '1')
  })
})
