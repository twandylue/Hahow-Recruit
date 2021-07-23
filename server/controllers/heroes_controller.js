require('dotenv').config()
const { getHeroes, getSingleHero } = require('../../util/hahowApi')
const { getCache } = require('../../util/cache')
const { cacheMode } = process.env

const listHeroes = async (req, res, next) => {
  // if in cache mode and the cache has data, use it directly
  if (cacheMode) {
    const cacheHeroes = await getCache('heroes')
    if (cacheHeroes) return res.status(200).json(JSON.parse(cacheHeroes))
  }
  const retryCount = 0
  const heroesResult = await getHeroes(retryCount, req.isUserAuth)
  if (heroesResult.statusCode === 200) {
    res.status(200).json({ heroes: heroesResult.heroes })
  } else {
    res.status(heroesResult.statusCode).json({ message: heroesResult.message })
  }
}

const singleHero = async (req, res, next) => {
  const heroId = req.params.id
  // if in cache mode and the cache has data, use it directly
  if (cacheMode) {
    const cacheSingoHero = await getCache(`${heroId}`)
    if (cacheSingoHero) return res.status(200).json(JSON.parse(cacheSingoHero))
  }
  const retryCount = 0
  const singleHeroResult = await getSingleHero(retryCount, heroId, req.isUserAuth)
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
