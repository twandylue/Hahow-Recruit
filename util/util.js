// reference: https://thecodebarbarian.com/80-20-guide-to-express-error-handling
const wrapAsync = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch(next)
  }
}

const handler = (promise) => promise
  .then((data) => ([data, undefined]))
  .catch((error) => ([undefined, error]))

module.exports = {
  wrapAsync,
  handler
}
