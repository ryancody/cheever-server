
const mongoDb = require('mongodb')
const fs = require('fs')

// since settings is set out here, it does not need 'this' to reference within a function
// if settings were set in a function, it would need 'this' ... why?
let settings = {
    dbName:null,
    collection:null
}

let client, connect, db

let tester

exports.init = (s) => {
    Object.assign(settings, s)
}

exports.open = async () => {
    checkSettings()
    try{
        checkSettings()
    }catch(e){
        console.log(e)
    }
    console.log('connecting to db...')
    try{
        client = await new mongoDb.MongoClient( process.env.DB_URL, {useNewUrlParser:true} )
        connect = await client.connect()
        db = await connect.db(settings.dbName)
        console.log('db connection successful')
    }catch(e) {
        console.log(e.stack)
    }
}

// find a document and update it
exports.findOneAndUpdate = async (query, data) => {
    checkSettings()
    let doc = await db.collection( settings.collection ).findOneAndUpdate( query, {$set: data} )
    console.log('find one and update',doc)
    return doc
}

// find a document
exports.findOne = async (query) => {
    checkSettings()
    console.log('querying',query)
    
    query = parseInt(query)
    let doc = await db.collection( settings.collection ).findOne( {appid:query} )
    //console.log('find',doc)
    fs.writeFileSync('./resp.json',JSON.stringify(doc))
    return doc
}

// insert array of documents
exports.insertMany = async (insertArray) => {
    checkSettings()
    
    await db.collection( settings.collection ).insertMany( insertArray, (err, res) => {
        if (err) throw err
        console.log("Number of documents inserted: " + res.insertedCount)
    })
}

exports.close = async () => {
    checkSettings()
    try{
        await client.close()
        console.log('db connection closed')
    }catch(e) {
        console.log(e.stack)
    }
}

checkSettings = () => {
    if(!settings.dbName || !settings.collection){
        throw new Error('Settings not initialized, pass dbname and collection to init function')
    }
}

exports.client = client