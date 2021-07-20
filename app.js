require('dotenv').config();
const { rateLimiterRoute } = require('./util/ratelimiter');
const { PORT_TEST, PORT, NODE_ENV } = process.env;
const port = NODE_ENV === 'test' ? PORT_TEST : PORT;
// Express Initialization
const express = require('express');
const cors = require('cors');
const app = express();
// app.set('trust proxy', true);
// app.set('json spaces', 2);

// app.use(express.static('public'));
// app.use(express.json({ limit: '210000kb' }));
// app.use(express.urlencoded({ extended: true }));

// CORS allow all
app.use(cors());

app.use(
  rateLimiterRoute,
  [
    require('./server/routes/heroes_route'),
  ]
);

app.use(function (req, res, next) {
  res.status(404).send('404 page not found')
})

// Error handling
app.use(function (err, req, res, next) {
  console.log(err);
  res.status(500).send('Internal Server Error');
});

// listen
if (NODE_ENV === ('production' || 'development')) {
  app.listen(port, () => { console.log(`Listening on port: ${port}`); });
}

module.exports = app;
