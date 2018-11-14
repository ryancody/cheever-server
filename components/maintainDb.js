const fs = require('fs')
const mongoDb = require('mongodb')
const puppeteer = require('puppeteer')
const AWS = require('aws-sdk')
const appData = JSON.parse( fs.readFileSync(__dirname + '/../data/steam-apps.json') ).applist
const dbInstance = require('./dbInstance')

const dbSettings = {
    dbName:'cheever-db',
    collection:'test'
}

getPageUrl = (appid) => {
    return `https://steamcommunity.com/stats/${appid}/achievements`
}

exports.run = async (appid) => {

    dbInstance.init(dbSettings)
    await dbInstance.open()

    let cheevs = await this.getCheevs(appid)
    cheevs = addImgData(cheevs)
    console.log(cheevs)
    return
    //await dbInstance.insertMany([{many:'test'},{many:'othertest'}])
    await dbInstance.findOneAndUpdate({appid:311690}, {achievements:cheevs})

    await dbInstance.close()
}

exports.getCheevs = async (appid) => {

    if(!appid){
        throw new Error(`App ID ${appid} Invalid!`)
    }
    
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
                        imgPath:value.querySelector("img").src
                    }
                )
            })

            return achievements
        })

        await browser.close()

        console.log(achievements)
        return achievements
            
    }catch(e){
        console.log(e.stack)
    }
}

addImgData = (achievements) => {
    achievements = achievements.map((i) => {
        Object.assign(i, {imgData: this.imgBufferData(i)} )
    })
    return achievements
}

exports.test = async () => {
    let url = 'https://scrapethissite.com/static/images/scraper-icon.png'

    const browser = await puppeteer.launch()
    
    const page = await browser.newPage()

    let data = await page.goto( url)

    let imgBuffer = await data.buffer();

    fs.writeFileSync("./img.png", imgBuffer, function(err) {
        if(err) {
            return console.log(err);
        }
    
        console.log("The file was saved!");
    });

    dbInstance.init({dbName:'cheever-db',collection:'test'})
    await dbInstance.open()

    await dbInstance.findOneAndUpdate({appid:10}, {img:imgBuffer})

    await dbInstance.close()

    console.log(imgBuffer)
}

// takes path, downloads image buffer, returns buffer
imgBufferData = async (achievement) => {
    let data = await request(achievement.imgPath, function(err,res,buffer) {
        return buffer
    })

    console.log(data)
    return data
}

/*
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
*/