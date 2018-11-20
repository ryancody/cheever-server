const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const fs = require('fs')

// make sure you have env variables for key and secret when using AWS

exports.createObject = async (bucket, folder, item, data) => {
    console.log('creating item named ' + item + ' in folder ' + folder + ' in bucket ' + bucket)
    try{
        s3.putObject({
            Bucket: bucket,
            Key: folder + '/' + item,
            Body: data,
            ACL: 'public-read'
        }, (err, data) => {
            if(err) console.log('failed creating item', err)
            else console.log('success!', data)
        })
    }catch(e){
        console.log(e)
    }
}