const { handler } = require('../../util/util')
const axios = require('axios')
require('dotenv').config()
const { hahowServerHost, hahowServerAuthPath } = process.env
const authUrl = `${hahowServerHost}/${hahowServerAuthPath}`

const isPositiveInteger = (str) => /^\+?([1-9]\d*)$/.test(str)
// ^\\d+$ Positive Integer or 0
// ^\+?([1-9]\d*)$ Positive Integer
const checkId = (req, res, next) => {
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

  if (err) {
    // if verification err , avoid getting unauthorized data , return
    return res.status(400).json({ message: 'Please check Name & Password' })
  }
  if (authResult.status === 200 && authResult.statusText === 'OK') {
    // if verification ok , but message = Backend Error , not retry , avoid getting unauthorized data
    isAuth = true
  }
  req.isUserAuth = isAuth
  return next()
}

module.exports = {
  checkId,
  authCheck
}
