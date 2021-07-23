const axios = require('axios')
require('dotenv').config()
const { hahowServerHost, hahowServerHeroesPath, retryLimit, cacheMode } = process.env
const heroesUrl = `${hahowServerHost}/${hahowServerHeroesPath}`
const { handler } = require('./util')
const { setCache } = require('./cache.js')

const getHeroProfile = async function (retryCount, heroId) {
  const [heroProfileResult, error] = await handler(axios.get(`${heroesUrl}/${heroId}/profile`))
  if (error) return { statusCode: 500, message: 'server error, please try it again' }
  if (heroProfileResult.status === 200 && heroProfileResult.data.code === 1000) {
    // if status = 200 , but data.code = 1000 , retry limited number of times
    if (retryCount < retryLimit) {
      retryCount++
      return await getHeroProfile(retryCount, heroId)// bring in the remaining retryCount
    } else {
      return { statusCode: 500, message: 'server error, please try it again' }
    }
  } else {
    return { statusCode: 200, profile: heroProfileResult.data }
  }
}

const getHeroes = async function (retryCount, isUserAuth) {
  const [heroesResult, error] = await handler(axios.get(heroesUrl))
  if (error) return { statusCode: 500, message: 'server error, please try it again' }
  if (heroesResult.status === 200 && heroesResult.data.code === 1000) {
    // if status = 200 , but data.code = 1000 , retry limited number of times
    if (retryCount < retryLimit) {
      retryCount++
      return await getHeroes(retryCount)// bring in the remaining retryCount
    } else {
      return { statusCode: 500, message: 'server error, please try it again' }
    }
  }
  // cache store heroes
  if (cacheMode) await setCache('heroes', JSON.stringify({ heroes: heroesResult.data }), 'EX', 600)
  if (isUserAuth) {
    for (const i in heroesResult.data) {
      const heroProfileResult = await getHeroProfile(0, heroesResult.data[i].id)
      if (heroProfileResult.statusCode === 200) {
        heroesResult.data[i].profile = heroProfileResult.profile
        // cache store each hero profile
        if (cacheMode) await setCache(`${heroesResult.data[i].id}_profile`, JSON.stringify(heroesResult.data[i]), 'EX', 600)
      } else {
        return { statusCode: 500, message: 'server error, please try it again' }
      }
    }
    // cache store heroes profile
    if (cacheMode) await setCache('heroes_profiles', JSON.stringify({ heroes: heroesResult.data }), 'EX', 600)
    return { statusCode: 200, heroes: heroesResult.data }
  } else {
    return { statusCode: 200, heroes: heroesResult.data }
  }
}

const getSingleHero = async function (retryCount, heroId, isUserAuth) {
  const [heroResult, error] = await handler(axios.get(`${heroesUrl}/${heroId}`))
  if (error) return { statusCode: 400, message: 'maybe the input hero id out of range, please try other id again' }
  if (heroResult.status === 200 && heroResult.data.code === 1000) {
    // if status = 200 , but data.code = 1000 , retry limited number of times
    if (retryCount < retryLimit) {
      retryCount++
      return await getSingleHero(retryCount, heroId, isUserAuth)// bring in the remaining retryCount
    } else {
      return { statusCode: 500, message: 'server error, please try it again' }
    }
  } else {
    // cache store each hero
    if (cacheMode) await setCache(`${heroId}`, JSON.stringify(heroResult.data), 'EX', 600)
    // if auth ok , add profile data
    if (isUserAuth) {
      const heroProfileResult = await getHeroProfile(0, heroId)// now retryCount = 0
      if (heroProfileResult.statusCode === 200) {
        heroResult.data.profile = heroProfileResult.profile
        // cache store each hero profile
        if (cacheMode) await setCache(`${heroId}_profile`, JSON.stringify(heroResult.data), 'EX', 600)
        return { statusCode: 200, hero: heroResult.data }
      } else {
        return { statusCode: 500, message: 'server error, please try it again' }
      }
    } else {
      return { statusCode: 200, hero: heroResult.data }
    }
  }
}

module.exports = {
  getHeroes,
  getSingleHero,
  getHeroProfile
}
