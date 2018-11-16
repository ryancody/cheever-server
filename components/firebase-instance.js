const firebase = require('firebase-admin')
const request = require('request-promise')

// Set the configuration for your app
config = require('../key/cheever-ee772-firebase-adminsdk-y9e1y-a8deb02b0c.json')

firebase.initializeApp(config)

// Get a reference to the storage service, which is used to create references in your storage bucket
var storage = firebase.storage()

let storageRef = storage.ref()

let imagesRef = storageRef.child('images')

let curImg = imagesRef.child('newfile.jpg')

let options = {
  method:'GET',
  encoding:null,
  url:'https://scrapethissite.com/static/images/scraper-icon.png'
}
request(options, (err, res, body) => {
  
  curImg.put(body)
})