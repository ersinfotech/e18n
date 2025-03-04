const express = require('express')

var app = express()

var e18n = require('./index')

e18n.use(app)

app.listen(3000)
