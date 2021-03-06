const { handler } = require('../../util/util')
const axios = require('axios')
require('dotenv').config()
const { HAHOWSERVER_HOST, HAHOWSERVER_AUTHPATH } = process.env
const authUrl = `${HAHOWSERVER_HOST}/${HAHOWSERVER_AUTHPATH}`

const isPositiveInteger = (str) => /^\+?([1-9]\d*)$/.test(str)
// ^\\d+$ Positive Integer or 0
// ^\+?([1-9]\d*)$ Positive Integer
const checkIdFormat = (req, res, next) => {
  if (!isPositiveInteger(req.params.id)) {
    return res.status(400).json({
      message: 'the hero id should be a positive interger'
    })
  }
  return next()
}

const authCheck = async (req, res, next) => {
  let isAuth = false
  const { name, password } = req.headers
  if (!name && !password) return next()
  const [authResult, err] = await handler(axios.post(`${authUrl}`, { name, password }))
  // if verification err , avoid getting unauthorized data , return
  if (err) return res.status(400).json({ message: 'Please check Name & Password' })
  // if verification ok , but data.code = 1000 , not retry , treated as not auth
  if (authResult.status === 200 && authResult.data.code !== 1000) {
    isAuth = true
  }
  req.isUserAuth = isAuth
  return next()
}

module.exports = {
  checkIdFormat,
  authCheck
}
