var describe = require('mocha').describe
var it = require('mocha').it
var assert = require('assert')
var content = require('./rewired')({
  './test/content/': {
    'test.txt': 'test 2'
  }
})
var plugin = content('./test/content/*')

describe('plugin', function () {
  it('it should append to existing pages', function (done) {
    plugin([{content: 'test 1'}], function (err, pages) {
      if (err) {
        done(err)
      } else {
        assert.deepEqual(pages, [{content: 'test 1'}, {content: 'test 2', file: './test/content/test.txt'}])

        done()
      }
    })
  })
})
