const firebase = require('firebase-admin')
const request = require('request-promise')
const credentials = JSON.parse(require('../key/firebase.json'))

// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage')
 
// Your Google Cloud Platform project ID
const projectId = 'cheever-ee772'
 
go()

async function go() {

  let storage

  try{
    // Creates a client
    storage = await new Storage({
      projectId: projectId,
    });
  }catch(e){
    console.log('create client error', console.log(e))
  }
  
   
  // The name for the new bucket
  const bucketName = 'my-new-bucket';
   
  try{
    // Creates the new bucket
    await storage.createBucket(bucketName)
    console.log('bucket ready')
  }catch(e){
    console.log('createbucket error', console.log(e))
  }
}