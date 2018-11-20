const fs = require('fs')
const mongoDb = require('mongodb')
const dbInstance = require('./db-instance')
const puppeteer = require('puppeteer')
const request = require('request-promise')
const appData = JSON.parse( fs.readFileSync(__dirname + '/../data/steam-apps.json') ).applist
const s3 = require('./s3-instance')
const md5 = require('md5')

const dbSettings = {
    dbName:'cheever-db',
    collection:'test'
}

const s3settings = {
    bucketName:'cheever'
}

getPageUrl = (appid) => {
    return `https://steamcommunity.com/stats/${appid}/achievements`
}

exports.populateApp = async (appid) => {

    console.log('updating ' + appid)
    
    try{
        cheevs = await scrape(appid)
        await addImgData(appid,cheevs)
        let doc = await dbInstance.findOneAndUpdate({appid:appid}, {achievements:cheevs})
        console.log('update complete: ' + appid)
        return doc
    }catch(e){
        console.log(e)
    }
}

// scrape a site by app id, return achievements with name description and icon path
scrape = async (appid) => {
    
    try{
        const browser = await puppeteer.launch()
    
        const page = await browser.newPage()
    
        await page.goto( getPageUrl(appid) )
    
        let achievements = await page.evaluate(()=>{
            
            let achievements = []

            let row = document.querySelectorAll(".achieveRow")
            
            row.forEach( (value) => {

                achievements.push(
                    {
                        name:value.querySelector("h3").innerText,
                        desc:value.querySelector("h5").innerText,
                        srcImgUrl:value.querySelector("img").src
                    }
                )
            })

            return achievements
        })

        await browser.close()

        console.log('achievements scraped succesfully')

        return achievements
            
    }catch(e){
        console.log(e.stack)
    }
}

// takes achievement, adds buffer data to img
addImgData = async (appid,achievements) => {

    let promises = achievements.map( async (i) => {

        console.log('upload buffer data for ' + i.name)
        await uploadImgToS3(appid, i)
    })

    achievements = await Promise.all(promises)

    console.log('img data added succesfully')
    return achievements
}

// create item in s3 bucket with img data
uploadImgToS3 = async (appid, achievement) => {
    let data = await imgBufferData(achievement.srcImgUrl)

    await s3.createObject(s3settings.bucketName, appid, md5(achievement.name) + '.jpg', data)
}

// takes path, downloads image buffer, returns buffer
imgBufferData = async (path) => {

    let options = {
        uri: path,
        method: 'GET',
        encoding: null
    }

    let data = await request(options, function(err,res,buffer) {
        return buffer
    })

    return data
}