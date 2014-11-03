var mock = require('mock-fs');
var assert = require('chai').assert;
var Q = require('q');
var rewire = require('rewire');
var content = rewire('../index.js');
var glob = rewire('glob');

var mocked_fs = mock.fs({
    './test/content/': {
        '2010-01-01.test1.txt': 'test 1',
        '2010-01-02.test2.txt': 'test 2',
        '2010-01-03.test3.txt': 'test 3',
        'category': {
            '2010-01-01.test1.txt': 'category test 1',
            '2010-01-02.test2.txt': 'category test 2',
            '2010-01-03.test3.txt': 'category test 3'
        }
    }
});

glob.__set__('fs', mocked_fs);

content.__set__('glob', glob);

content.__set__('fs', mocked_fs);

describe('plugin', function(){

    describe('.configure', function(){

        it('if it\'s not called the content directory and the converter should be the defaults', function(done){

            assert.equal(content.content_directory, './content/');

            content.converter('testing', function(err, content){

                assert.equal(content, 'testing');
            });

            done();
        });

        it('should set the content directory and the converter', function(done){

            var content_directory = './test/content/';
            var converter = function (content, cb) {

                return cb(null, '<p>' + content + '</p>');
            };

            content.configure(content_directory, converter);

            assert.equal(content.content_directory, content_directory);
            assert.equal(content.converter, converter);

            done();
        });
    });

    it('it should append to existing pages', function(done){

        done();
    });
});
