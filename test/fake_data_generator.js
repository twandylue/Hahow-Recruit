require('dotenv').config()
const { cache } = require('../util/cache.js')
const { HAHOWSERVER_HOST, HAHOWSERVER_HEROESPATH, HAHOWSERVER_AUTHPATH } = process.env
// Used Nock to mock data of third party API(hahow API)
const nock = require('nock')
const {
  hahowHeroes,
  hahowHeroId1,
  hahowHeroId1Profile,
  hahowHeroId2Profile,
  hahowHeroId3Profile,
  hahowHeroId4Profile,
  hahowCheckAuth
} = require('./fake_data')

cache.flushdb(function (err, ok) {
  if (err) {
    console.log(err)
    return err
  }
  if (ok) {
    console.log(ok)
  }
})

const nockFakeData = () => {
  nock(HAHOWSERVER_HOST)
    .get('/' + HAHOWSERVER_HEROESPATH).times(2).reply(200, hahowHeroes)
  nock(HAHOWSERVER_HOST)
    .get(`/${HAHOWSERVER_HEROESPATH}/1`).times(2).reply(200, hahowHeroId1)
  nock(HAHOWSERVER_HOST)
    .get(`/${HAHOWSERVER_HEROESPATH}/1/profile`).times(2).reply(200, hahowHeroId1Profile)
  nock(HAHOWSERVER_HOST)
    .get(`/${HAHOWSERVER_HEROESPATH}/2/profile`).times(1).reply(200, hahowHeroId2Profile)
  nock(HAHOWSERVER_HOST)
    .get(`/${HAHOWSERVER_HEROESPATH}/3/profile`).times(1).reply(200, hahowHeroId3Profile)
  nock(HAHOWSERVER_HOST)
    .get(`/${HAHOWSERVER_HEROESPATH}/4/profile`).times(1).reply(200, hahowHeroId4Profile)
  nock(HAHOWSERVER_HOST)
    .post('/' + HAHOWSERVER_AUTHPATH, { name: 'hahow', password: 'rocks' }).times(2).reply(200, hahowCheckAuth)
}

const nockInputErrFakeData = () => {
  nock(HAHOWSERVER_HOST)
    .get(`/${HAHOWSERVER_HEROESPATH}/1`).times(3).reply(404)
  nock(HAHOWSERVER_HOST)
    .post('/' + HAHOWSERVER_AUTHPATH, { name: 'hahow', password: 'rockssss' }).times(1).reply(401)
}

const nockcleanAll = () => {
  nock.cleanAll()
}

module.exports = {
  nockFakeData,
  nockInputErrFakeData,
  nockcleanAll
}
