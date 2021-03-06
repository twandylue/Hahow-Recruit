require('dotenv').config()
const { rateLimiterRoute } = require('./util/ratelimiter')
const { PORT, NODE_ENV } = process.env
// Express Initialization
const express = require('express')
const cors = require('cors')
const app = express()
const path = require('path')

app.set('trust proxy', true)
app.set('json spaces', 2)
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(express.static('public'))
// routes
app.use(
  rateLimiterRoute,
  [
    require('./server/routes/heroes_route')
  ]
)
// homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/homepage.html'))
})
// Page not found
app.use(function (req, res, next) {
  res.status(404).send('404 page not found')
})

// Error handling
app.use(function (err, req, res, next) {
  console.log(err)
  res.status(500).send('Internal Server Error')
})

// check production mode or development mode
if (NODE_ENV === 'production' || NODE_ENV === 'development') {
  app.listen(PORT, () => { console.log(`Listening on port: ${PORT}`) })
}

module.exports = app
