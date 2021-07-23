const axios = require('axios')
require('dotenv').config()
const { hahowServerHost, hahowServerHeroesPath, retryLimit, cacheMode } = process.env
const heroesUrl = `${hahowServerHost}/${hahowServerHeroesPath}`
const { handler } = require('./util')
const { setCache } = require('./cache.js')

const getHeroes = async function (retryCount, isUserAuth) {
  const [heroesResult, error] = await handler(axios.get(heroesUrl))
  if (error) return { statusCode: 500, message: 'server error, please try it again' }
  if (heroesResult.status === 200 && heroesResult.data.code === 1000) {
    // if status = 200 , but data.code = 1000 , retry limited number of times
    if (retryCount < retryLimit) {
      retryCount++
      getHeroes(retryCount)
    } else {
      return { statusCode: 500, message: 'server error, please try it again' }
    }
  }
  if (cacheMode) await setCache('heroes', JSON.stringify({ heroes: heroesResult.data }), 'EX', 600)// set cache 10min
  return { statusCode: 200, heroes: heroesResult.data }
}

const getSingleHero = async function (retryCount, heroId, isUserAuth) {
  const [heroResult, error] = await handler(axios.get(`${heroesUrl}/${heroId}`))
  if (error) return { statusCode: 400, message: 'maybe the input hero id out of range, please try other id again' }
  if (heroResult.status === 200 && heroResult.data.code === 1000) {
    // if status = 200 , but data.code = 1000 , retry limited number of times
    if (retryCount < retryLimit) {
      retryCount++
      getSingleHero(retryCount, heroId, isUserAuth)
    } else {
      return { statusCode: 500, message: 'server error, please try it again' }
    }
  } else {
    if (cacheMode) await setCache(`${heroId}`, JSON.stringify(heroResult.data), 'EX', 600) // set cache 10min
    return { statusCode: 200, hero: heroResult.data }
  }
}

module.exports = {
  getHeroes,
  getSingleHero
}
