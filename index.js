const express = require('express')
const fs = require('fs')
const puppeteer = require('puppeteer')

const settings = JSON.parse( fs.readFileSync('settings.json') )
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
