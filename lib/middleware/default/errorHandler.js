module.exports = (err, req, res, next) => {
  // console.error(`ERROR: ${err.message}`) // eslint-disable-line
  // console.error(`STACK: ${err.stack}`) // eslint-disable-line
  res.status(400).send({
    success: false,
    reason: err.message
  })
}
