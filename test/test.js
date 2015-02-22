var mock = require('mock-fs');
var assert = require('chai').assert;
var rewire = require('rewire');

describe('plugin', function(){

    it('it should append to existing pages', function(done){

        var content = rewire('../index.js');
        var glob = rewire('glob');

        var mocked_fs = mock.fs({
            './test/content/': {
                'test.txt': 'test 2'
            }
        });

        glob.__set__('fs', mocked_fs);

        content.__set__('glob', glob);

        content.__set__('fs', mocked_fs);

        var converters = [function(page){

            return Promise.resolve(page);
        }];

        var plugin = content('./test/content/*', converters);

        plugin([{content: 'test 1'}]).then(function(pages){

            assert.deepEqual(pages, [{content: 'test 1'}, {content: 'test 2', file: './test/content/test.txt'}]);

            done();
        });
    });

    it('it should call converters in order', function(done){

        var content = rewire('../index.js');
        var glob = rewire('glob');

        var mocked_fs = mock.fs({
            './test/content/': {
                'test.txt': 'test'
            }
        });

        glob.__set__('fs', mocked_fs);

        content.__set__('glob', glob);

        content.__set__('fs', mocked_fs);

        var converters = [
            function(page){

                page.content += ' 1';

                return Promise.resolve(page);
            },
            function(page){

                page.content += ' 2';

                return Promise.resolve(page);
            },
            function(page){

                page.content += ' 3';

                return Promise.resolve(page);
            },
        ];

        var plugin = content('./test/content/*', converters);

        plugin([]).then(function(pages){

            assert.deepEqual(pages, [{content: 'test 1 2 3',file: './test/content/test.txt'}]);

            done();
        });
    });
});
