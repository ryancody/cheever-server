const express = require('express')
const dbInstance = require('./components/dbInstance')
const maintainDb = require('./components/maintainDb')
const fbi = require('./components/firebase-instance')

return

const app = express()

// listen on port 5000, local
// or process.env.PORT, heroku - dynamically assigned
const server = app.listen(process.env.PORT || 5000)

// dbOptions to be sent to dbinstance init
const dbOptions = {dbName:'cheever-db', collection:'test'}

// serve /public when public is requested
app.use(express.static('public'))

// start the server
start()

// return entry when appid is passed
app.get('/get', get)
async function get (req, res) {

    res.append('Content-Type', 'application/json')
    res.append('Access-Control-Allow-Origin', '*')

    await dbInstance.open()

    try {
        appid = checkAppid(req.query.appid)
    }catch(e) {
        console.log('caught', e)
    }

    let doc = await dbInstance.findOne(appid)

    dbInstance.close()

    console.log(doc)

    res.send(doc)
}

// scrape cheevos based on appid
app.get('/populateApp', populateApp)
async function populateApp (req, res) {

    res.append('Content-Type', 'application/json')
    res.append('Access-Control-Allow-Origin', '*')

    await dbInstance.open()

    try {
        appid = checkAppid(req.query.appid)
    }catch(e) {
        console.log('caught', e)
    }

    let doc = await maintainDb.populateApp(appid)

    dbInstance.close()

    console.log('doc returned successfully')
    //console.log(doc)

    res.send(doc)
}

async function start () {

    try{
        console.log('testing db connection...')
        dbInstance.init(dbOptions)
        await dbInstance.open()
        await dbInstance.close()
    }catch(e){
        console.log(e)
    }

    dbInstance.init(dbOptions)
    console.log('listening on port: ' + server.address().port)
}

function checkAppid (appid) {

    
    appid = parseInt(appid)
    
    let reg = /^\d+$/

    if(!reg.test(appid)){
        throw 'appid must be an integer'
    }
    
    if(appid === ''){
        throw 'appid blank'
    }

    if(!appid){
        throw 'appid undefined'
    }

    return appid
}