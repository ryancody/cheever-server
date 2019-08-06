const fs = require('fs')

let data = fs.readFileSync('./data/steam-apps.json')

data = JSON.parse(data)

let output = []
for(let i = 0; i < data.applist.apps.length; i++) {
    output.push(data.applist.apps[i].name)
}

fs.writeFileSync('./namesonly.txt', output.toString())