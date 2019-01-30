import express from 'express'

const router = express.Router()

router.get('/', function(req, res) {
  res.json({ message: "Hey, You're in" })
})

module.exports = router
