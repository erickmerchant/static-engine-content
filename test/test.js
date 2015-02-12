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

        var directory = './test/content/';
        var converters = [function(page){

            return Promise.resolve(page);
        }];

        content.configure(directory, converters);

        var plugin = content('*');

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

        var directory = './test/content/';
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

        content.configure(directory, converters);

        var plugin = content('*');

        plugin([]).then(function(pages){

            assert.deepEqual(pages, [{content: 'test 1 2 3',file: './test/content/test.txt'}]);

            done();
        });
    });

    describe('.configure', function(){

        it('if it\'s not called the content directory and the converter should be the defaults', function(done){

            var content = require('../index.js');

            assert.deepEqual(content.directory, './');

            assert.deepEqual(content.converters, []);

            done();
        });

        it('should set the content directory and the converter', function(done){

            var content = require('../index.js');

            var directory = './test/content/';
            var converters = [function(page){

                return Promise.resolve(page);
            }];

            content.configure(directory, converters);

            assert.equal(content.directory, directory);
            assert.equal(content.converters, converters);

            done();
        });
    });
});
