const express = require('express')
const dbInstance = require('./components/db-instance')
const maintainDb = require('./components/maintain-db')

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

    let passedFunc = dbInstance.findOne
    dbConnectionWrap(req, res, passedFunc)
}

// scrape cheevos based on appid
app.get('/populateApp', populateApp)
async function populateApp (req, res) {

    let passedFunc = maintainDb.populateApp
    dbConnectionWrap(req, res, passedFunc)
}

// framework for a db connection, pass db operation in
async function dbConnectionWrap (req, res, passedFunc) {
    
    res.append('Content-Type', 'application/json')
    res.append('Access-Control-Allow-Origin', '*')

    try{

        await dbInstance.open()

        try {
            appid = checkAppid(req.query.appid)
        }catch(e) {
            console.error('caught', e)
        }
    
        let doc = await passedFunc(req.query.appid)
    
        dbInstance.close()
    
        console.log('doc returned successfully')
        //console.log(doc)
    
        res.send(doc)
    } catch (e) {
        
        dbInstance.close()
        console.error(e)
    }
}

// test db connection on start
async function start () {

    try{
        console.log('testing db connection...')
        dbInstance.init(dbOptions)
        await dbInstance.open()
        await dbInstance.close()
    }catch(e){
        console.error(e)
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