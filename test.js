var describe = require('mocha').describe
var it = require('mocha').it
var assert = require('assert')

describe('plugin', function () {
  it('it should append to existing pages', function (done) {
    var plugin = mock({
      './test/content/test.txt': 'test 2'
    })
    var content = plugin('./test/content/*')

    content([{content: 'test 1'}], function (err, pages) {
      assert.equal(null, err)
      assert.deepEqual(pages, [{content: 'test 1'}, {content: 'test 2', file: './test/content/test.txt'}])

      done()
    })
  })

  it('it should handle glob errors', function (done) {
    var plugin = mock({
      './test/content/test.txt': 'test 2'
    }, {
      glob: new Error('glob error!')
    })
    var content = plugin('./test/content/*')

    content([{content: 'test 1'}], function (err) {
      assert.equal(err.message, 'glob error!')

      done()
    })
  })

  it('it should handle fs.readFile errors', function (done) {
    var plugin = mock({
      './test/content/test.txt': 'test 2'
    }, {
      fs: new Error('fs.readFile error!')
    })
    var content = plugin('./test/content/*')

    content([{content: 'test 1'}], function (err) {
      assert.equal(err.message, 'fs.readFile error!')

      done()
    })
  })
})

function mock (files, errors) {
  var rewire = require('rewire')
  var plugin = rewire('./index.js')

  plugin.__set__('glob', function (pattern, options, callback) {
    if (errors && errors.glob) {
      callback(errors.glob)
    } else {
      callback(null, Object.keys(files))
    }
  })

  plugin.__set__('fs', {
    readFile: function (filename, options, callback) {
      if (errors && errors.fs) {
        callback(errors.fs)
      } else {
        callback(null, files[filename])
      }
    }
  })

  return plugin
}
