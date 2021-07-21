const axios = require('axios')

require('dotenv').config()
const { hahowServerHost, hahowServerHeroesPath, retryLimit } = process.env

const heroesListUrl = `${hahowServerHost}/${hahowServerHeroesPath}`

const handler = (promise) => promise
  .then((data) => ([data, undefined]))
  .catch((error) => ([undefined, error]))

const listHeroes = async (req, res, next) => {
  const [heroesRes, error] = await handler(axios.get(heroesListUrl))
  if (error) {
    return res.status(500).json({
      message: 'server error, please try it again'
    })
  }
  if (heroesRes.status === 200 && heroesRes.data.code === 1000) {
    return res.status(500).json({
      message: 'server error, please try it again'
    })
  }
  return res.status(200).json({
    heroes: heroesRes.data
  })
}

const singleHero = async (req, res, next) => {
  const heroId = req.params.id
  let retryCount = 0
  const test = async function () {
    const [heroDetailRes, error] = await handler(axios.get(`${heroesListUrl}/${heroId}`))
    if (error) {
      return res.status(400).json({
        message: 'maybe the input hero id out of range, please try other id again'
      })
    }
    if (heroDetailRes.status === 200 && heroDetailRes.data.code === 1000) {
      retryCount++
      if (retryCount < retryLimit) {
        test()
      } else {
        return res.status(500).json({
          message: 'server error, please try it again'
        })
      }
    } else {
      return res.status(200).json(heroDetailRes.data)
    }
  }
  test()
}

module.exports = {
  listHeroes,
  singleHero
}
