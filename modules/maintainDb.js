const fs = require('fs')

const appData = JSON.parse( fs.readFileSync(__dirname + '/data/steam-apps.json') )

exports.run = () => {

}