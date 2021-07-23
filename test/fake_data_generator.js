require('dotenv').config()
const { hahowServerHost, hahowServerHeroesPath, hahowServerAuthPath } = process.env
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

const nockFakeData = () => {
  nock(hahowServerHost)
    .get('/' + hahowServerHeroesPath).times(2).reply(200, hahowHeroes)
  nock(hahowServerHost)
    .get(`/${hahowServerHeroesPath}/1`).times(2).reply(200, hahowHeroId1)
  nock(hahowServerHost)
    .get(`/${hahowServerHeroesPath}/1/profile`).times(2).reply(200, hahowHeroId1Profile)
  nock(hahowServerHost)
    .get(`/${hahowServerHeroesPath}/2/profile`).times(1).reply(200, hahowHeroId2Profile)
  nock(hahowServerHost)
    .get(`/${hahowServerHeroesPath}/3/profile`).times(1).reply(200, hahowHeroId3Profile)
  nock(hahowServerHost)
    .get(`/${hahowServerHeroesPath}/4/profile`).times(1).reply(200, hahowHeroId4Profile)
  nock(hahowServerHost)
    .post('/' + hahowServerAuthPath, { name: 'hahow', password: 'rocks' }).times(2).reply(200, hahowCheckAuth)
}

const nockInputErrFakeData = () => {
  nock(hahowServerHost)
    .get(`/${hahowServerHeroesPath}/1`).times(3).reply(404)
  nock(hahowServerHost)
    .post('/' + hahowServerAuthPath, { name: 'hahow', password: 'rockssss' }).times(1).reply(401)
}

const nockcleanAll = () => {
  nock.cleanAll()
}

module.exports = {
  nockFakeData,
  nockInputErrFakeData,
  nockcleanAll
}
