const fs = require('fs')
const mongoDb = require('mongodb')
const puppeteer = require('puppeteer')
const AWS = require('aws-sdk')
const request = require('request').defaults({ encoding: null });
const appData = JSON.parse( fs.readFileSync(__dirname + '/../data/steam-apps.json') ).applist

let client = mongoDb.MongoClient

const dbName = "cheever-db"
const collection = "games"

getPageUrl = (appid) => {
    return `https://steamcommunity.com/stats/${appid}/achievements`
}

async function dbConnect() {
    
    try{
        client = await new mongoDb.MongoClient(process.env.DB_URL, {useNewUrlParser:true})

        // Use connect method to connect to the server
        let conn = await client.connect()
        db = await conn.db(dbName)

        console.log("Connected successfully to server")
        return db

    }catch(e){
        console.log(e.stack)
    }
}

async function dbClose(){
    try{
        console.log('closing connection')
        await client.close()
    }catch(e) {
        console.log(e.stack)
    }
}

// insert array of documents
async function insertMany (insertArray) {
    
    await db.collection(collection).insertMany( insertArray, (err, res) => {
        if (err) throw err
        console.log("Number of documents inserted: " + res.insertedCount)
    })
}

exports.run = async () => {

    dbConnect()

    console.log(process.env.CURRENT)
}

exports.getCheevs = async (appid) => {
    
    try{
        const browser = await puppeteer.launch()
    
        const page = await browser.newPage()
    
        await page.goto( getPageUrl(appid) )
    
        let achievements = await page.evaluate(()=>{
            
            let achievements = []

            let row = document.querySelectorAll(".achieveRow")
            
            row.forEach( (value) => {

                console.log(value)

                achievements.push(
                    {
                        name:value.querySelector("h3").innerText,
                        desc:value.querySelector("h5").innerText,

                    }
                )
            })

            return achievements
        })

        console.log(achievements)
            
        await browser.close()
    }catch(e){
        console.log(e.stack)
    }
}

exports.getImg = async () => {

    try{
        let db = await dbConnect()
    
        const browser = await puppeteer.launch()
    
        const page = await browser.newPage()
    
        await page.goto( "https://scrapethissite.com/" )
    
        let imgsrc = await page.evaluate(()=>{
            
            let imgsrc = document.querySelector("#townhall-logo").src
            console.log("img src: ", imgsrc)
            
            return imgsrc
        })
        
        //mongoDb.model({data:Buffer, contentType:String})
        //img = await getImg(img)

        img = request(imgsrc, function(err, response, buffer) {
            // console.log("get buffer",buffer)
            return buffer
        });

        console.log('img to bucket',img)
        await this.bucket(img)
            
        await browser.close()

        //await db.collection("testimg").insertOne({ image:img })
        //console.log("inserted to collection successfully")

    }catch(e){
        console.log(e.stack)
    }

    dbClose()
}

//downloads image, writes buffer data to text, reads buffer data from txt, writes to file.
//easily convert this to storing to s3
exports.test = () => {
    let path = "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/311690/ab30d369b608afee26e68255afdd08bf17a6b8ff.jpg"
    let img = request(path, function(err,res,buffer) {
        fs.writeFileSync("test.txt", buffer)
        fs.writeFileSync('image.png', fs.readFileSync("test.txt"));
    })

    console.log("I DID IT")
}


exports.bucket = async (img) => {
    try{
        //let cfg = new AWS.Config( { process.env.S3_KEY, process.env.S3_SECRET, 'us-east-1' } )
        await AWS.config.update( { "accessKeyId":process.env.S3_KEY, "secretAccessKey":process.env.S3_SECRET, "region":'us-east-1'} )

        var s3Bucket = new AWS.S3( { params: {Bucket: 'cheever-files'} } )
        //let img = await fs.readFileSync("a.jpg")

        var putData = {Key: `test${Date.now()}.jpg`, Body: img};

        await s3Bucket.putObject(putData, (e, data) => {
            if(e) console.log("putObject", e.stack)
            console.log('bucket data', data)
        });

        console.log('done')
    }catch(e){
        console.log(e.stack)
    }
}