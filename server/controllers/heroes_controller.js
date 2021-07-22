const { handler } = require('../../util/util')
const axios = require('axios')
require('dotenv').config()
const { hahowServerHost, hahowServerHeroesPath, retryLimit } = process.env
const heroesUrl = `${hahowServerHost}/${hahowServerHeroesPath}`

const listHeroes = async (req, res, next) => {
  console.log(req.isUserAuth)
  let retryCount = 0
  const getHeroes = async function () {
    const [heroesResult, error] = await handler(axios.get(heroesUrl))
    if (error) {
      return res.status(500).json({
        message: 'server error, please try it again'
      })
    }
    if (heroesResult.status === 200 && heroesResult.data.code === 1000) {
      // if status = 200 , but data.code = 1000 , retry limited number of times
      if (retryCount < retryLimit) {
        retryCount++
        getHeroes()
      } else {
        return res.status(500).json({
          message: 'server error, please try it again'
        })
      }
    }
    return res.status(200).json({
      heroes: heroesResult.data
    })
  }
  getHeroes()
}

const singleHero = async (req, res, next) => {
  console.log(req.isUserAuth)
  const heroId = req.params.id
  let retryCount = 0
  const getSingleHero = async function () {
    const [heroDetailResult, error] = await handler(axios.get(`${heroesUrl}/${heroId}`))
    if (error) {
      return res.status(400).json({
        message: 'maybe the input hero id out of range, please try other id again'
      })
    }
    if (heroDetailResult.status === 200 && heroDetailResult.data.code === 1000) {
      // if status = 200 , but data.code = 1000 , retry limited number of times
      if (retryCount < retryLimit) {
        retryCount++
        getSingleHero()
      } else {
        return res.status(500).json({
          message: 'server error, please try it again'
        })
      }
    } else {
      return res.status(200).json(heroDetailResult.data)
    }
  }
  getSingleHero()
}

module.exports = {
  listHeroes,
  singleHero
}
