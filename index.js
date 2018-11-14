const express = require('express')
const maintainDb = require('./components/maintainDb')
const dbInstance = require('./components/dbInstance')

const app = express()

// listen on port 5000, local
// or process.env.PORT, heroku - dynamically assigned
const server = app.listen(process.env.PORT || 5000)

// serve /public when public is requested
app.use(express.static('public'))

start()

// return document when appid is passed
app.get('/getDoc', getDoc)
async function getDoc (req, resp) {

    let appid = req.query.appid

    let doc = await dbInstance.findOne(appid)
    resp.send(doc)
}

async function start() {

    dbInstance.init({dbName:'cheever-db', collection:'test'})
    await dbInstance.open()
    console.log('listening on ', process.env.PORT)
}



/* testing below */


// run 'run' when /run is requested
app.get('/run', run)

async function run (req, resp) {
    let appid = req.query.appid
    resp.send(`querying ${appid}`)
    maintainDb.run(appid)
}

app.get('/test', test)

// maintainDb.test()
async function test (req, resp) {
    maintainDb.test()
    resp.send('testing...')
}