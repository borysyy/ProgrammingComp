const express = require('express')
const path = require('path')
const app = express()
const port = 3000

app.use(express.static('dist'))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist'))
})

app.listen(port, () => {
  console.log(`Website listening on port ${port}`)
})