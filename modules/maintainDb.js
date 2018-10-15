const fs = require('fs')
const mongoDb = require('mongodb')
const puppeteer = require('puppeteer')

const appData = JSON.parse( fs.readFileSync(__dirname + '/../data/steam-apps.json') ).applist

let client = mongoDb.MongoClient

const dbName = "cheever-db"
const collection = "games"

getPageUrl = (appid) => {
    return achievementURL = `https://steamcommunity.com/stats/${appid}/achievements`
}

async function dbConnect() {
    
    client = await new mongoDb.MongoClient(process.env.DB_URL, {useNewUrlParser:true});

    // Use connect method to connect to the server
    let conn = await client.connect()
    db = await conn.db(dbName)

    console.log("Connected successfully to server")
    
    await dbClose()
    
}

async function dbClose(){
    await client.close()
}

// insert array of documents
async function insertMany (insertArray) {
    
    await db.collection(collection).insertMany( insertArray, (err, res) => {
        if (err) throw err
        console.log("Number of documents inserted: " + res.insertedCount)
    })
}

exports.run = async () => {
    console.log("searching " + achievementURL)

    dbConnect()

    console.log(process.env.CURRENT)
}

exports.getCheevs = async (appid) => {
    
    try{
        const browser = await puppeteer.launch()
    
        const page = await browser.newPage()
    
        await page.goto( getPageUrl(appid) )

        await page.screenshot({path:"here.png"})
    
        let achievements = await page.evaluate(()=>{
            
            let achievements = []

            let row = document.querySelectorAll(".achieveRow")
            
            row.forEach( (value) => {

                console.log(value)

                achievements.push(
                    {
                        name:value.querySelector("h3").innerText,
                        desc:value.querySelector("h5").innerText
                    }
                )
            })

            return achievements
        })

        console.log(achievements)
            
        await browser.close()
    }catch(e){
        console.log(e)
    }
}