require('dotenv').config()
const { PORT_TEST, PORT, NODE_ENV } = process.env
const port = NODE_ENV === 'test' ? PORT_TEST : PORT

const express = require('express')
const cors = require('cors')
const app = express()
const rateLimit = require('express-rate-limit')
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})

app.set('trust proxy', true)
app.set('json spaces', 2)
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(limiter)
app.use(
  [
    require('./server/routes/heroes_route')
  ]
)

app.use(function (req, res, next) {
  res.status(404).send('404 page not found')
})

// Error handling
app.use(function (err, req, res, next) {
  console.log(err)
  res.status(500).send('Internal Server Error')
})

// listen
if (NODE_ENV === ('production' || 'development')) {
  app.listen(port, () => { console.log(`Listening on port: ${port}`) })
}

module.exports = app
