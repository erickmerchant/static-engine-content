var mock = require('mock-fs');
var assert = require('assert');
var rewire = require('rewire');

describe('plugin', function(){

    it('it should append to existing pages', function(done){

        var content = rewire('../index.js');
        var glob = rewire('glob');

        var mockedFS = mock.fs({
            './test/content/': {
                'test.txt': 'test 2'
            }
        });

        glob.__set__('fs', mockedFS);

        content.__set__('glob', glob);

        content.__set__('fs', mockedFS);

        var plugin = content('./test/content/*');

        plugin([{content: 'test 1'}])
        .then(function(pages){

            assert.deepEqual(pages, [{content: 'test 1'}, {content: 'test 2', file: './test/content/test.txt'}]);

            done();
        })
        .catch(done);
    });
});
