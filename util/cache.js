require('dotenv').config()
const { REDIS_HOST } = process.env
const { promisify } = require('util')

const redis = require('redis')
const cache = redis.createClient(6379, REDIS_HOST, { no_ready_check: true })
cache.on('ready', () => {
  console.log('redis is ready')
})
cache.on('error', () => {
  console.log('redis is error')
})

cache.flushdb(function (err, ok) {
  if (err) {
    console.log(err)
    return err
  }
  if (ok) {
    console.log(ok)
  }
})

const getCache = promisify(cache.get).bind(cache)
const setCache = promisify(cache.set).bind(cache)
const delCache = promisify(cache.del).bind(cache)

module.exports = {
  cache,
  getCache,
  setCache,
  delCache
}
