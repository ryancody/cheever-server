const fs = require('fs')
const mongoDb = require('mongodb')
const dbInstance = require('./dbInstance')
const puppeteer = require('puppeteer')
const request = require('request-promise')
const appData = JSON.parse( fs.readFileSync(__dirname + '/../data/steam-apps.json') ).applist

const dbSettings = {
    dbName:'cheever-db',
    collection:'test'
}

getPageUrl = (appid) => {
    return `https://steamcommunity.com/stats/${appid}/achievements`
}

exports.populateApp = async (appid) => {

    console.log('updating ' + appid)
    
    try{
        cheevs = await scrape(appid)
        await addImgData(cheevs)
        let doc = await dbInstance.findOneAndUpdate({appid:appid}, {achievements:cheevs})
        console.log('update complete: ' + appid)
        return doc
    }catch(e){
        console.log(e)
    }
}

scrape = async (appid) => {
    
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

        console.log('achievements scraped succesfully')

        return achievements
            
    }catch(e){
        console.log(e.stack)
    }
}

// takes achievement, adds buffer data to img
addImgData = async (achievements) => {

    let promises = achievements.map( async (i) => {

        //console.log('requesting buffer data for ' + i.name)
        let d = await imgBufferData(i)
        Object.assign(i, {img: d} )
    })

    achievements = await Promise.all(promises)

    console.log('img data added succesfully')
    return achievements
}

// takes path, downloads image buffer, returns buffer
imgBufferData = async (achievement) => {

    let options = {
        url: achievement.imgPath,
        encode: null,
        method:'GET'
    }

    let data = await request(options, function(err,res,buffer) {
        return buffer
    })

    //console.log('returning buffer data for ' + achievement.name)

    return data
}