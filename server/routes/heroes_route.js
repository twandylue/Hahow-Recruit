const router = require('express').Router();

const {
  wrapAsync
} = require('../../util/util');

const {
  heroesData
} = require('../controllers/heroes_controller');

router.route('/heroes')
  .get(wrapAsync(heroesData));

module.exports = router;
