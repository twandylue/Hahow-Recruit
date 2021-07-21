const router = require('express').Router()

const {
  wrapAsync
} = require('../../util/util')

const {
  listHeroes,
  singleHero
} = require('../controllers/heroes_controller')

router.route('/heroes')
  .get(wrapAsync(listHeroes))

router.route('/heroes/:id')
  .get(wrapAsync(singleHero))

module.exports = router
