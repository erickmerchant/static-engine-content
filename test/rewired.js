var rewire = require('rewire')
var mock = require('mock-fs')

module.exports = function (fs) {
  var content = rewire('../index.js')
  var glob = rewire('glob')

  var mockedFS = mock.fs(fs)

  glob.__set__('fs', mockedFS)

  content.__set__('glob', glob)

  content.__set__('fs', mockedFS)

  return content
}
