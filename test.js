var describe = require('mocha').describe
var it = require('mocha').it
var assert = require('assert')
var plugin = mock({
  './test/content/test.txt': 'test 2'
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

function mock (files) {
  var rewire = require('rewire')
  var plugin = rewire('./index.js')

  plugin.__set__('glob', function (pattern, options, callback) {
    callback(null, Object.keys(files))
  })

  plugin.__set__('fs', {
    readFile: function (filename, options, callback) {
      callback(null, files[filename])
    }
  })

  return plugin
}
