require('dotenv').config()
const { getHeroes, getSingleHero } = require('../../util/hahowApi')
const { getCache } = require('../../util/cache')
const { CACHE_MODE } = process.env

const listHeroes = async (req, res, next) => {
  const isUserAuth = req.isUserAuth
  // if in cache mode and the cache has data, use it directly
  if (CACHE_MODE === 'on') {
    let cacheHeroes
    if (isUserAuth) {
      cacheHeroes = await getCache('heroes_profiles')
    } else {
      cacheHeroes = await getCache('heroes')
    }
    if (cacheHeroes) return res.status(200).json(JSON.parse(cacheHeroes))
  }
  const heroesResult = await getHeroes(0, isUserAuth) // now retryCount = 0
  if (heroesResult.statusCode === 200) {
    res.status(200).json({ heroes: heroesResult.heroes })
  } else {
    res.status(heroesResult.statusCode).json({ message: heroesResult.message })
  }
}

const singleHero = async (req, res, next) => {
  const heroId = req.params.id
  const isUserAuth = req.isUserAuth
  // if in cache mode and the cache has data, use it directly
  if (CACHE_MODE === 'on') {
    let cacheSingoHero
    if (req.isUserAuth) {
      cacheSingoHero = await getCache(`${heroId}_profile`)
    } else {
      cacheSingoHero = await getCache(`${heroId}`)
    }
    if (cacheSingoHero) return res.status(200).json(JSON.parse(cacheSingoHero))
  }
  const singleHeroResult = await getSingleHero(0, heroId, isUserAuth) // now retryCount = 0
  if (singleHeroResult.statusCode === 200) {
    res.status(200).json(singleHeroResult.hero)
  } else {
    res.status(singleHeroResult.statusCode).json({ message: singleHeroResult.message })
  }
}

module.exports = {
  listHeroes,
  singleHero
}
