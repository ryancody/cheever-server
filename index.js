const express = require('express')
const fs = require('fs')
const puppeteer = require('puppeteer')
const maintainDb = require('./components/maintainDb')

const app = express()

// listen on port 5000, local
// or process.env.PORT, heroku - dynamically assigned
const server = app.listen(process.env.PORT || 5000)

// serve /public when /public is requested
app.use(express.static('/public'))

// run 'run' when /run is requested
app.get('/run', run)

async function run (req, resp) {
    let appid = req.query.appid
    resp.send(`querying ${appid}`)
    maintainDb.run(appid)
}

app.get('/test', test)

maintainDb.test()
async function test (req, resp) {
    maintainDb.test()
    resp.send('testing...')
}

console.log('ready')