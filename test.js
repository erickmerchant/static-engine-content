var describe = require('mocha').describe
var it = require('mocha').it
var assert = require('assert')
var plugin = mock({
  './test/content/': {
    'test.txt': 'test 2'
  }
})
var content = plugin('./test/content/*')

describe('plugin', function () {
  it('it should append to existing pages', function (done) {
    content([{content: 'test 1'}], function (err, pages) {
      if (err) {
        done(err)
      } else {
        assert.deepEqual(pages, [{content: 'test 1'}, {content: 'test 2', file: './test/content/test.txt'}])

        done()
      }
    })
  })
})

function mock (fsConfig) {
  var rewire = require('rewire')
  var mockFS = require('mock-fs')
  var plugin = rewire('./index.js')
  var glob = rewire('glob')
  var fs = mockFS.fs(fsConfig)

  glob.__set__('fs', fs)

  plugin.__set__('glob', glob)

  plugin.__set__('fs', fs)

  return plugin
}
