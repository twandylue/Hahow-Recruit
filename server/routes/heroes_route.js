const router = require('express').Router()

const {
  wrapAsync
} = require('../../util/util')

const {
  checkId,
  authCheck
} = require('../middlewares/heroes_middlewares.js')

const {
  listHeroes,
  singleHero
} = require('../controllers/heroes_controller')

router.route('/heroes')
  .get(authCheck, wrapAsync(listHeroes))

router.route('/heroes/:id')
  .get(checkId, authCheck, wrapAsync(singleHero))

module.exports = router
