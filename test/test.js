var mock = require('mock-fs');
var moment = require('moment');
var assert = require('chai').assert;
var Q = require('q');
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
        var converters = [function(file, page, next){

            next(file, page);
        }];

        content.configure(directory, converters);

        var plugin = content('*');

        plugin([{content: 'test 1'}], function(pages, next){

            assert.deepEqual(pages, [{content: 'test 1'}, {content: 'test 2'}]);

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
            function(file, page, next){

                page.content += ' 1';

                next(file, page);
            },
            function(file, page, next){

                page.content += ' 2';

                next(file, page);
            },
            function(file, page, next){

                page.content += ' 3';

                next(file, page);
            },
        ];

        content.configure(directory, converters);

        var plugin = content('*');

        plugin([], function(pages, next){

            assert.deepEqual(pages, [{content: 'test 1 2 3'}]);

            done();
        });
    });

    it('it should sort results by date descending', function(done){

        var content = rewire('../index.js');
        var glob = rewire('glob');

        var mocked_fs = mock.fs({
            './test/content/': {
                'test-1.txt': '2015-01-01',
                'test-2.txt': '2015-01-02',
                'test-3.txt': '2015-01-03',
            }
        });

        glob.__set__('fs', mocked_fs);

        content.__set__('glob', glob);

        content.__set__('fs', mocked_fs);

        var directory = './test/content/';
        var converters = [
            function(file, page, next){

                page.date = moment(page.content, 'YYYY-MM-DD');

                next(file, page);
            }
        ];

        content.configure(directory, converters);

        var plugin = content('*');

        plugin([], function(pages, next){

            assert.deepEqual(pages, [
                {content: '2015-01-03', date: moment('2015-01-03', 'YYYY-MM-DD')},
                {content: '2015-01-02', date: moment('2015-01-02', 'YYYY-MM-DD')},
                {content: '2015-01-01', date: moment('2015-01-01', 'YYYY-MM-DD')}
            ]);

            done();
        });
    });

    describe('.configure', function(){

        it('if it\'s not called the content directory and the converter should be the defaults', function(done){

            var content = rewire('../index.js');
            var glob = rewire('glob');

            var mocked_fs = mock.fs({
                './test/content/': {

                }
            });

            glob.__set__('fs', mocked_fs);

            content.__set__('glob', glob);

            content.__set__('fs', mocked_fs);

            assert.deepEqual(content.directory, './');

            assert.deepEqual(content.converters, []);

            done();
        });

        it('should set the content directory and the converter', function(done){

            var content = rewire('../index.js');
            var glob = rewire('glob');

            var mocked_fs = mock.fs({
                './test/content/': {

                }
            });

            glob.__set__('fs', mocked_fs);

            content.__set__('glob', glob);

            content.__set__('fs', mocked_fs);

            var directory = './test/content/';
            var converters = [function(file, page, next){

                next(file, page);
            }];

            content.configure(directory, converters);

            assert.equal(content.directory, directory);
            assert.equal(content.converters, converters);

            done();
        });
    });
});
