const express = require('express')
const fs = require('fs')
const puppeteer = require('puppeteer')
const maintainDb = require('./modules/maintainDb')

const settings = JSON.parse( fs.readFileSync(__dirname+'/data/settings.json') )
console.log("settings:")
console.log(settings)

const app = express()

// listen on port 5000, local
// or process.env.PORT, heroku - dynamically assigned
const server = app.listen(process.env.PORT || 5000)

// serve /public when /public is requested
app.use(express.static('public'))

// call scrape when /scrape is requested
app.get('/scrape', scrape)

// run maintainDb when /maintain is requested
app.get('/maintain', checkAppDatabase)

// scrape for cheevos
app.get('/getCheevos', getCheevos)

maintainDb.test()

async function getCheevos(request, response){
    let appid = request.query.appid
    console.log(appid)
    await maintainDb.getCheevs(appid)
    response.send('done!')
}

app.get('/bucket', bucket)
async function bucket(request, response){
    await maintainDb.bucket()
    response.send('bucketing')
}

app.get('/img', getImg)

async function getImg(request, response) {
    await maintainDb.getImg()
    response.send('done!')
}

async function scrape(request, response){

    try{
        // get 'search' arg from query
        let arg = request.query.search

        const browser = await puppeteer.launch()
    
        const page = await browser.newPage()
    
        await page.goto(settings.url)
    
        let data = await grabData(page, arg)
    
        await response.send( data )  //cant stringify to here for some reason
            
        await browser.close()
    }catch(e){
        console.log(e)
    }
}

async function checkAppDatabase (request, response) {
    response.send('connecting to sql...')
    maintainDb.run()
}

async function grabData(page, selector){

    let items = await page.evaluate(() => {

        console.log('im here1')
        //const grabPages = (row, selector) => row.querySelector(selector).innerText.trim()

        const data = []

        let pages = $(".page")

        pages.each( function (index, value) {
            let title = $(value).find(".page-title").text().trim()
            let desc = $(value).find(".session-desc").text().trim()

            data.push({
                title: title,
                desc: desc
            })
        })

        console.log(data)
        return data
    })

    return items
}
