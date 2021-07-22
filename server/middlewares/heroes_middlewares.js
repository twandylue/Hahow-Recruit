const { handler } = require('../../util/util')
const axios = require('axios')
require('dotenv').config()
const { hahowServerHost, hahowServerAuthPath } = process.env
const authUrl = `${hahowServerHost}/${hahowServerAuthPath}`

const isPositiveInteger = (str) => /^\+?([1-9]\d*)$/.test(str)
// ^\\d+$ 非負整數（正整數 + 0）
// ^[0-9]*[1-9][0-9]*$ 正整數
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
    return res.status(400).json({ message: 'Please check Name & Password' })
  }
  if (authResult.status === 200 && authResult.statusText === 'OK') {
    isAuth = true
  }

  req.isUserAuth = isAuth
  return next()
}

module.exports = {
  checkId,
  authCheck
}
