var test = require('tape')

test('it should append to existing pages', function (t) {
  var plugin = mock({
    './test/content/test.txt': 'test 2'
  })
  var content = plugin('./test/content/*')

  content([{content: 'test 1'}], function (err, pages) {
    t.equal(null, err)
    t.deepEqual(pages, [{content: 'test 1'}, {content: 'test 2', file: './test/content/test.txt'}])

    t.end()
  })
})

test('it should handle glob errors', function (t) {
  var plugin = mock({
    './test/content/test.txt': 'test 2'
  }, {
    glob: new Error('glob error!')
  })
  var content = plugin('./test/content/*')

  content([{content: 'test 1'}], function (err) {
    t.equal(err.message, 'glob error!')

    t.end()
  })
})

test('it should handle fs.readFile errors', function (t) {
  var plugin = mock({
    './test/content/test.txt': 'test 2'
  }, {
    fs: new Error('fs.readFile error!')
  })
  var content = plugin('./test/content/*')

  content([{content: 'test 1'}], function (err) {
    t.equal(err.message, 'fs.readFile error!')

    t.end()
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
