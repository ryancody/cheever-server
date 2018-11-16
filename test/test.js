var assert = require('assert')
var index = require('../index.js')


describe('index', function() {

    it('should initialize db', function () {

        assert.equal(index.dbInstance.settings, index.dbOptions)
    })

    
})