const {
  cache,
  getCache,
  setCache,
  delCache
} = require('../../util/cache.js')

const heroes = async (name) => {
  try {
    return { data: 'Insert OK' }
  } catch (error) {
    console.log(error)
    return { error: error }
  }
}

async function getCacheData (name) {
  const cacheGet = await getCache(`${name}`)
  if (cacheGet) {
    const data = JSON.parse(cacheGet).data
    return data
  } else {

  }
}
async function setCacheData (name, data) {
  await setCache(`${name}`, JSON.stringify({ data: data }))
}

module.exports = {
  heroes
}
