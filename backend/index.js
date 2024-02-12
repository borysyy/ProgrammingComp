// index.js
const express = require('express')
const path = require('path')
const router = express.Router()

router.use(express.static('dist'))

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist'))
})

module.exports = router
